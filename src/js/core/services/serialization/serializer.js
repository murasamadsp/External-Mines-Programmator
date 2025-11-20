// Mines Programmator Serializer (JS port of ProgramSerializer.cs)
// Implements the exact format probing, encoding, and decoding logic
// defined in docs-to-do/code/ProgramSerializer.cs

import { ProgramFormatVersion, Instruction, ProgAction } from "../../index.js";
import { MAX_INSTRUCTIONS } from "../../constants/grid.js";
import { LZMACompressor } from "../lzma-compressor.js";
import {
  V1_PAGE_WIDTH,
  MODERN_PAGE_WIDTH,
  MODERN_PAGE_HEIGHT,
  MODERN_PAGE_SIZE,
  ALPHABET,
  V1_MAPPINGS,
  V3_MAPPINGS
} from "./serializer-constants.js";
import {
  findMapping,
  pushInstruction,
  padRowToModernWidth,
  appendNoneUntil,
  parseLabelParts,
  asciiToUint8,
  uint8ToAscii
} from "./serializer-utils.js";

export class ProgramSerializer {
  static probeFormatVersion(source) {
    if (typeof source !== "string" || source.length === 0) {
      throw new Error("Program source must be a non-empty string");
    }

    if (
      (source.length - 2) % 4 === 0 &&
      /^@\d[\da-zA-Z/+]+={0,2}$/.test(source)
    ) {
      if (source[1] === "4") {
        return ProgramFormatVersion.Packed;
      }
      throw new Error("Malformed program");
    }

    if (/^\$[\w()=<>|+~,:#! ^;?{}\n-.]+$/.test(source)) {
      return ProgramFormatVersion.Version3;
    }

    if (source.length % 4 === 0 && /^XQAA[\da-zA-Z/+]+={0,2}$/.test(source)) {
      return ProgramFormatVersion.Base64;
    }

    return ProgramFormatVersion.Version1;
  }

  static async decode(source, forcedVersion) {
    const version = forcedVersion ?? this.probeFormatVersion(source);
    switch (version) {
      case ProgramFormatVersion.Version1:
        return this.decodeV1(source);
      case ProgramFormatVersion.Base64:
        return await this.decodeV2(source);
      case ProgramFormatVersion.Version3:
        return this.decodeV3(source);
      case ProgramFormatVersion.Packed:
        throw new Error("Packed (V4) format is not implemented");
      default:
        throw new Error("Unsupported program format");
    }
  }

  static async encode(instructions, format = ProgramFormatVersion.Base64) {
    switch (format) {
      case ProgramFormatVersion.Base64:
        return await this.encodeV2(instructions);
      case ProgramFormatVersion.Version3:
        return this.encodeV3(instructions);
      case ProgramFormatVersion.Packed:
        throw new Error("EncodeV4 is not implemented");
      default:
        throw new Error("Unsupported format for encoding");
    }
  }

  static decodeV1(source) {
    const ret = [];
    let column = 0;
    let remaining = source;
    while (remaining.length > 0) {
      if (column >= V1_PAGE_WIDTH) {
        padRowToModernWidth(ret, column);
        column = 0;
      }

      let match = remaining.match(/^(L|G[0-4])\((.+?)\)/);
      if (match) {
        const label = match[2];
        const mapping = V1_MAPPINGS.find(([key]) => key === match[1]);
        if (!mapping) {
          throw new Error("Malformed program");
        }
        pushInstruction(ret, mapping[1], label);
        remaining = remaining.slice(match[0].length);
        column++;
        continue;
      }

      if (remaining[0] === "/") {
        const skipUntil =
          (Math.floor(ret.length / MODERN_PAGE_SIZE) + 1) * MODERN_PAGE_SIZE;
        appendNoneUntil(ret, skipUntil);
        remaining = remaining.slice(1);
        column = 0;
        continue;
      }

      match = remaining.match(new RegExp(`^-[${ALPHABET}]`));
      if (match) {
        const skip = ALPHABET.indexOf(remaining[1]);
        for (let i = 0; i < skip; i++) {
          pushInstruction(ret, ProgAction.None);
          column++;
          if (column >= V1_PAGE_WIDTH) {
            padRowToModernWidth(ret, column);
            column = 0;
          }
        }
        remaining = remaining.slice(2);
        continue;
      }

      const mapping = findMapping(remaining, V1_MAPPINGS);
      if (!mapping) {
        throw new Error("Malformed program");
      }
      pushInstruction(ret, mapping[1]);
      remaining = remaining.slice(mapping[0].length);
      column++;
    }
    return ret;
  }

  static async decodeV2(source) {
    const compressed = this.base64Decode(source);
    const decompressed = await LZMACompressor.decompress(compressed);
    if (decompressed.length < 4) {
      throw new Error("Malformed program");
    }
    const length = this.readInt32LE(decompressed, 0);
    if (length < 0 || length > decompressed.length) {
      throw new Error("Malformed program");
    }
    const operators = decompressed.slice(4, 4 + length);
    const labelsRaw = uint8ToAscii(decompressed.slice(4 + length))
      .toUpperCase()
      .split(":");
    const ret = new Array(length);
    for (let i = 0; i < length; i++) {
      const action = operators[i];
      const labelInfo = parseLabelParts(labelsRaw[i] || "");
      ret[i] = new Instruction(action, labelInfo.label, labelInfo.value);
    }
    return ret;
  }

  static decodeV3(source) {
    let remaining = source.startsWith("$") ? source.slice(1) : source;
    remaining = remaining
      .replace(/\.0\./g, "\n\n\n\n\n\n\n\n\n")
      .replace(/\.9\./g, "\n\n\n\n\n\n\n\n")
      .replace(/\.8\./g, "\n\n\n\n\n\n\n")
      .replace(/\.7\./g, "\n\n\n\n\n\n")
      .replace(/\.6\./g, "\n\n\n\n\n")
      .replace(/\.5\./g, "\n\n\n\n")
      .replace(/\./g, "\n")
      .replace(/_/g, "   ");

    const ret = [];

    while (remaining.length > 0) {
      if (remaining[0] === "~") {
        const skipUntil =
          (Math.floor(ret.length / MODERN_PAGE_SIZE) + 1) * MODERN_PAGE_SIZE;
        appendNoneUntil(ret, skipUntil);
        remaining = remaining.slice(1);
        continue;
      }
      if (remaining[0] === "\n") {
        const skipUntil =
          (Math.floor(ret.length / MODERN_PAGE_WIDTH) + 1) * MODERN_PAGE_WIDTH;
        appendNoneUntil(ret, skipUntil);
        remaining = remaining.slice(1);
        continue;
      }

      const conditionalGoto = remaining.match(/^(!)?\?(.+?)</);
      if (conditionalGoto) {
        const label = conditionalGoto[2];
        const action = conditionalGoto[1]
          ? ProgAction.YesNoGoto
          : ProgAction.NoYesGoto;
        pushInstruction(ret, action, label);
        remaining = remaining.slice(conditionalGoto[0].length);
        continue;
      }

      const debugMatch = remaining.match(/^(!)?\{(.+?)\}/);
      if (debugMatch) {
        const label = debugMatch[2];
        const action = debugMatch[1]
          ? ProgAction.DebugPause
          : ProgAction.DebugShow;
        pushInstruction(ret, action, label);
        remaining = remaining.slice(debugMatch[0].length);
        continue;
      }

      let match = remaining.match(/^\|(.+?):/);
      if (match) {
        pushInstruction(ret, ProgAction.Label, match[1]);
        remaining = remaining.slice(match[0].length);
        continue;
      }

      match = remaining.match(/^(#R|[:=-])(.+?)>/);
      if (match) {
        const label = match[2];
        const action =
          match[1] === "#R"
            ? ProgAction.CallWhenDied
            : match[1] === ":"
              ? ProgAction.Call
              : match[1] === "-"
                ? ProgAction.CallArg
                : ProgAction.CallState;
        pushInstruction(ret, action, label);
        remaining = remaining.slice(match[0].length);
        continue;
      }

      match = remaining.match(/^>(.+?)\|/);
      if (match) {
        pushInstruction(ret, ProgAction.Goto, match[1]);
        remaining = remaining.slice(match[0].length);
        continue;
      }

      match = remaining.match(/^\((.+?)(<[>=]?|>?=?)(-?\d+)\)/);
      if (match) {
        const label = match[1];
        const value = parseInt(match[3], 10);
        const comparator = match[2];
        const action = {
          "=": ProgAction.VarEqualsNumber,
          ">=": ProgAction.VarGreaterThanOrEqualNumber,
          ">": ProgAction.VarGreaterThanNumber,
          "<=": ProgAction.VarLessThanOrEqualNumber,
          "<": ProgAction.VarLessThanNumber,
          "<>": ProgAction.VarNotEqualsNumber,
        }[comparator];
        if (!action) {
          throw new Error("Malformed program");
        }
        pushInstruction(ret, action, label, value);
        remaining = remaining.slice(match[0].length);
        continue;
      }

      const mapping = findMapping(remaining, V3_MAPPINGS);
      if (!mapping) {
        throw new Error("Malformed program");
      }
      pushInstruction(ret, mapping[1]);
      remaining = remaining.slice(mapping[0].length);
    }

    return ret;
  }

  static decodeV4() {
    throw new Error("DecodeV4 is not implemented");
  }

  static async encodeV2(program) {
    this.validateInstructions(program);
    const labels = program
      .map(inst => this.formatLabel(inst.label, inst.value))
      .join(":");
    const labelBytes = asciiToUint8(labels);
    const buffer = new Uint8Array(4 + program.length + labelBytes.length);
    this.writeInt32LE(buffer, 0, program.length);
    for (let i = 0; i < program.length; i++) {
      buffer[4 + i] = program[i].action & 0xff;
    }
    buffer.set(labelBytes, 4 + program.length);
    const compressed = await LZMACompressor.compress(buffer);
    return this.base64Encode(compressed);
  }

  static encodeV3(program) {
    let sb = "";
    let spacesBacktrack = 0;
    let linesBacktrack = 0;

    for (let i = 0; i < program.length; i++) {
      const inst = program[i] || new Instruction(ProgAction.None, null, null);
      const col = i % MODERN_PAGE_WIDTH;
      const row = Math.floor(i / MODERN_PAGE_WIDTH) % MODERN_PAGE_HEIGHT;

      if (inst.action !== ProgAction.None) {
        linesBacktrack = 0;
        spacesBacktrack = 0;
      }

      sb += this.encodeActionSymbol(inst);
      if (inst.action === ProgAction.None) {
        spacesBacktrack++;
      }

      if (col === MODERN_PAGE_WIDTH - 1) {
        if (spacesBacktrack > 0) {
          sb = sb.slice(0, sb.length - spacesBacktrack);
        }
        sb += "\n";
        linesBacktrack++;
        spacesBacktrack = 0;
        if (row === MODERN_PAGE_HEIGHT - 1) {
          if (linesBacktrack > 0) {
            sb = sb.slice(0, sb.length - linesBacktrack);
          }
          sb += "~";
          linesBacktrack = 0;
        }
      }
    }

    if (sb.endsWith("~")) {
      sb = sb.slice(0, -1);
    }

    sb = sb
      .replace(/ {3}/g, "_")
      .replace(/\n{11}/g, "\n.0.\n")
      .replace(/\n{10}/g, "\n.9.\n")
      .replace(/\n{9}/g, "\n.8.\n")
      .replace(/\n{8}/g, "\n.7.\n")
      .replace(/\n{7}/g, "\n.6.\n")
      .replace(/\n{6}/g, "\n.5.\n")
      .replace(/\n{5}/g, "\n...\n")
      .replace(/\n{4}/g, "\n..\n")
      .replace(/\n{3}/g, "\n.\n")
      .replace(/~/g, "~\n");

    return `$${sb}`;
  }

  static encodeActionSymbol(inst) {
    switch (inst.action) {
      case ProgAction.None:
        return " ";
      case ProgAction.NextLine:
        return ",";
      case ProgAction.SetStart:
        return "#E";
      case ProgAction.Terminate:
        return "#S";
      case ProgAction.MoveUp:
        return "^W";
      case ProgAction.MoveLeft:
        return "^A";
      case ProgAction.MoveDown:
        return "^S";
      case ProgAction.MoveRight:
        return "^D";
      case ProgAction.Dig:
        return "z";
      case ProgAction.RotateUp:
        return "w";
      case ProgAction.RotateLeft:
        return "a";
      case ProgAction.RotateDown:
        return "s";
      case ProgAction.RotateRight:
        return "d";
      case ProgAction.RepeatLastAction:
        return "l";
      case ProgAction.MoveForward:
        return "^F";
      case ProgAction.RotateLefthand:
        return "CCW;";
      case ProgAction.RotateRighthand:
        return "CW;";
      case ProgAction.BuildBlock:
        return "b";
      case ProgAction.UseGeo:
        return "g";
      case ProgAction.BuildRoad:
        return "r";
      case ProgAction.Heal:
        return "h";
      case ProgAction.BuildQuadro:
        return "q";
      case ProgAction.RotateRandom:
        return "RAND;";
      case ProgAction.PlaySound:
        return "BEEP;";
      case ProgAction.Goto:
        return `>${inst.label || "0"}|`;
      case ProgAction.Call:
        return `:>${inst.label || "0"}>`;
      case ProgAction.CallArg:
        return `->${inst.label || "0"}>`;
      case ProgAction.Return:
        return "<|";
      case ProgAction.ReturnArg:
        return "<-|";
      case ProgAction.ReturnState:
        return "<=|";
      case ProgAction.CellUpLeft:
        return "[WA]";
      case ProgAction.CellDownRight:
        return "[SD]";
      case ProgAction.CellUp:
        return "[W]";
      case ProgAction.CellUpRight:
        return "[DW]";
      case ProgAction.CellLeft:
        return "[A]";
      case ProgAction.CellRight:
        return "[D]";
      case ProgAction.CellDownLeft:
        return "[AS]";
      case ProgAction.CellDown:
        return "[S]";
      case ProgAction.BooleanOR:
        return "OR";
      case ProgAction.BooleanAND:
        return "AND";
      case ProgAction.Label:
        return `|${inst.label || "0"}:`;
      case ProgAction.IsNotEmpty:
        return "=n";
      case ProgAction.IsEmpty:
        return "=e";
      case ProgAction.IsFalling:
        return "=f";
      case ProgAction.IsCrystal:
        return "=c";
      case ProgAction.IsAliveCrystal:
        return "=a";
      case ProgAction.IsFallingLikeBoulder:
        return "=b";
      case ProgAction.IsFallingLikeLiquid:
        return "=s";
      case ProgAction.IsBreakable:
        return "=k";
      case ProgAction.IsUnbreakable:
        return "=d";
      case ProgAction.IsRedRock:
        return "=K";
      case ProgAction.IsBlackRock:
        return "=B";
      case ProgAction.IsAcid:
        return "=A";
      case ProgAction.IsQuadro:
        return "=q";
      case ProgAction.IsRoad:
        return "=R";
      case ProgAction.IsRedBlock:
        return "=r";
      case ProgAction.IsYellowBlock:
        return "=y";
      case ProgAction.IsBox:
        return "=x";
      case ProgAction.IsStructure:
        return "=o";
      case ProgAction.IsGreenBlock:
        return "=g";
      case ProgAction.VarGreaterThanNumber:
        return `(${inst.label || "0"}>${inst.value ?? 0})`;
      case ProgAction.VarLessThanNumber:
        return `(${inst.label || "0"}<${inst.value ?? 0})`;
      case ProgAction.VarEqualsNumber:
        return `(${inst.label || "0"}=${inst.value ?? 0})`;
      case ProgAction.ShiftUp:
        return "[w]";
      case ProgAction.ShiftLeft:
        return "[a]";
      case ProgAction.ShiftDown:
        return "[s]";
      case ProgAction.ShiftRight:
        return "[d]";
      case ProgAction.CellForward:
        return "[F]";
      case ProgAction.ShiftForward:
        return "[f]";
      case ProgAction.CallState:
        return `=>${inst.label || "0"}>`;
      case ProgAction.YesNoGoto:
        return `!?${inst.label || "0"}<`;
      case ProgAction.NoYesGoto:
        return `?${inst.label || "0"}<`;
      case ProgAction.STDDig:
        return "DIGG;";
      case ProgAction.STDBlock:
        return "BUILD;";
      case ProgAction.STDHeal:
        return "HEAL;";
      case ProgAction.Flip:
        return "FLIP;";
      case ProgAction.STDTunnel:
        return "MINE;";
      case ProgAction.IsInsideGun:
        return "=G";
      case ProgAction.ChargeGun:
        return "FILL;";
      case ProgAction.IsHealthNotFull:
        return "=hp-";
      case ProgAction.IsHealthLessThanHalf:
        return "=hp50";
      case ProgAction.CellRighthand:
        return "[r]";
      case ProgAction.CellLefthand:
        return "[l]";
      case ProgAction.EnableAutoDig:
        return "AUT+";
      case ProgAction.DisableAutoDig:
        return "AUT-";
      case ProgAction.EnableAggression:
        return "AGR+";
      case ProgAction.DisableAggression:
        return "AGR-";
      case ProgAction.UseBoom:
        return "B1;";
      case ProgAction.UseRaz:
        return "B2;";
      case ProgAction.UseProt:
        return "B3;";
      case ProgAction.BuildWar:
        return "VB;";
      case ProgAction.CallWhenDied:
        return `#R${inst.label || "0"}<`;
      case ProgAction.UseGeopack:
        return "GEO;";
      case ProgAction.UseZZ:
        return "ZZ;";
      case ProgAction.UseC190:
        return "C190;";
      case ProgAction.UsePoly:
        return "POLY;";
      case ProgAction.Upgrade:
        return "UP;";
      case ProgAction.RefillCraft:
        return "CRAFT;";
      case ProgAction.UseNano:
        return "NANO;";
      case ProgAction.UseRem:
        return "REM;";
      case ProgAction.InventoryUp:
        return "iw";
      case ProgAction.InventoryLeft:
        return "ia";
      case ProgAction.InventoryDown:
        return "is";
      case ProgAction.InventoryRight:
        return "id";
      case ProgAction.EnableHand:
        return "Hand+";
      case ProgAction.DisableHand:
        return "Hand-";
      case ProgAction.DebugPause:
        return `!{${inst.label || ""}}`;
      case ProgAction.DebugShow:
        return `{${inst.label || ""}}`;
      case ProgAction.UNUSED_200:
        return "RESTART;";
      default:
        return " ";
    }
  }

  static formatLabel(label, value) {
    const baseLabel = (label || "0").toUpperCase();
    return value === null || value === undefined
      ? baseLabel
      : `${baseLabel}@${value}`;
  }

  static validateInstructions(instructions) {
    if (!Array.isArray(instructions)) {
      throw new Error("Instructions must be an array");
    }
    if (instructions.length > MAX_INSTRUCTIONS) {
      throw new Error("Instructions array is too long");
    }
    instructions.forEach((inst, index) => {
      // Allow empty instructions or instructions with valid action codes
      if (
        inst &&
        typeof inst.action !== "number" &&
        inst.action !== null &&
        inst.action !== undefined
      ) {
        throw new Error(
          `Invalid instruction action at index ${index}: ${inst.action}`
        );
      }
    });
  }

  static base64Decode(str) {
    const binary = atob(str);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  static base64Encode(bytes) {
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  static readInt32LE(buffer, offset) {
    return (
      (buffer[offset] & 0xff) |
      ((buffer[offset + 1] & 0xff) << 8) |
      ((buffer[offset + 2] & 0xff) << 16) |
      ((buffer[offset + 3] & 0xff) << 24)
    );
  }

  static writeInt32LE(buffer, offset, value) {
    buffer[offset] = value & 0xff;
    buffer[offset + 1] = (value >> 8) & 0xff;
    buffer[offset + 2] = (value >> 16) & 0xff;
    buffer[offset + 3] = (value >> 24) & 0xff;
  }
}
