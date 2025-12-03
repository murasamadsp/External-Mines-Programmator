// Mines Programmator Serializer (JS port of ProgramSerializer.cs)
// Implements the exact format probing, encoding, and decoding logic
// defined in docs-to-do/code/ProgramSerializer.cs

import { ProgramFormatVersion } from "../../constants/formats.js";
import { Instruction } from "../../types/instruction.js";
import { ProgAction } from "../../constants/actions.js";
import { MAX_INSTRUCTIONS } from "../../constants/grid.js";
import { LZMACompressor } from "../lzma-compressor.js";
import {
  MODERN_PAGE_WIDTH,
  MODERN_PAGE_HEIGHT,
  MODERN_PAGE_SIZE,
  ALPHABET,
} from "./serializer-constants.js";
import {
  pushInstruction,
  padRowToModernWidth,
  appendNoneUntil,
  parseLabelParts,
  asciiToUint8,
  uint8ToAscii,
} from "./serializer-utils.js";

export class ProgramSerializer {
  static probeFormatVersion(source) {
    if (typeof source !== "string" || source.length === 0) {
      throw new Error("Program source must be a non-empty string");
    }

    // Only LZMA Base64 format is supported
    if (source.length % 4 === 0 && /^XQAA[\da-zA-Z/+]+={0,2}$/.test(source)) {
      return ProgramFormatVersion.Base64;
    }

    throw new Error("Only LZMA Base64 format is supported");
  }

  static async decode(source, forcedVersion) {
    const version = forcedVersion ?? this.probeFormatVersion(source);
    switch (version) {
      case ProgramFormatVersion.Base64:
        return await this.decodeV2(source);
      default:
        throw new Error("Only LZMA Base64 format is supported");
    }
  }

  static async encode(instructions, format = ProgramFormatVersion.Base64) {
    if (format !== ProgramFormatVersion.Base64) {
      throw new Error("Only LZMA Base64 format is supported");
    }
    return await this.encodeV2(instructions);
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
    // Follow C# logic: ToUpper().Split(':')
    const labelsRaw = uint8ToAscii(decompressed.slice(4 + length))
      .toUpperCase()
      .split(":");
    const ret = new Array(length);
    for (let i = 0; i < length; i++) {
      const action = operators[i];
      const labelStr = labelsRaw[i] || "";
      const labelInfo = parseLabelParts(labelStr);
      ret[i] = new Instruction(action, labelInfo.label, labelInfo.value);
    }
    return ret;
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

  static encodeActionSymbol(inst) {
    switch (inst.action) {
      case ProgAction.None:
        return " ";
      case ProgAction.NextLine:
        return ",";
      case ProgAction.SetStart:
        return "#S";
      case ProgAction.Terminate:
        return "#E";
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
      case ProgAction.VarGreaterThanVar:
        const [label1_gt, label2_gt] = (inst.label || "A:B").split(":");
        return `(${label1_gt || "A"}>${label2_gt || "B"})`;
      case ProgAction.VarLessThanVar:
        const [label1_lt, label2_lt] = (inst.label || "A:B").split(":");
        return `(${label1_lt || "A"}<${label2_lt || "B"})`;
      case ProgAction.VarGreaterThanOrEqualVar:
        const [label1_gte, label2_gte] = (inst.label || "A:B").split(":");
        return `(${label1_gte || "A"}>=${label2_gte || "B"})`;
      case ProgAction.VarLessThanOrEqualVar:
        const [label1_lte, label2_lte] = (inst.label || "A:B").split(":");
        return `(${label1_lte || "A"}<=${label2_lte || "B"})`;
      case ProgAction.VarEqualsVar:
        const [label1_eq, label2_eq] = (inst.label || "A:B").split(":");
        return `(${label1_eq || "A"}=${label2_eq || "B"})`;
      case ProgAction.VarNotEqualsVar:
        const [label1_neq, label2_neq] = (inst.label || "A:B").split(":");
        return `(${label1_neq || "A"}<>${label2_neq || "B"})`;
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
    // Follow C# logic: x.label + (x.value.HasValue ? "@" + x.value : "")
    // In C#, if label is null, null + "@" + value = "@value" (null converts to empty string)
    // If label is null and value is null, null + "" = null (but string.Join converts null to "")
    const labelStr = label ?? "";
    return value !== null && value !== undefined
      ? `${labelStr}@${value}`
      : labelStr;
  }

  static validateInstructions(instructions) {
    if (!Array.isArray(instructions)) {
      throw new Error("Instructions must be an array");
    }
    // Note: C# EncodeV2 doesn't validate length, it just encodes what it receives
    // But we keep a reasonable limit to prevent memory issues
    if (instructions.length > MAX_INSTRUCTIONS) {
      throw new Error("Instructions array is too long");
    }
    if (instructions.length === 0) {
      throw new Error("Instructions array cannot be empty");
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
          `Invalid instruction action at index ${index}: ${inst.action}`,
        );
      }
    });
  }

  static base64Decode(str) {
    // Use Buffer in Node.js, atob in browser
    if (typeof Buffer !== "undefined") {
      return new Uint8Array(Buffer.from(str, "base64"));
    } else {
      const binary = atob(str);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    }
  }

  static base64Encode(bytes) {
    // Use Buffer in Node.js, btoa in browser
    if (typeof Buffer !== "undefined") {
      return Buffer.from(bytes).toString("base64");
    } else {
      let binary = "";
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    }
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
