// Mines Programmator Serializer
// Handles Base64 v3 program format with LZMA compression as per specification
//
// STRICT RULES:
// 1. No fallback mechanisms allowed - all operations must use proper libraries
// 2. Must use ready-made libraries, no custom implementations
// 3. LZMA compression/decompression must work correctly
// 4. All data must be processed through proper library functions
// 5. Follow exact C# ProgramSerializer.DecodeV2 implementation

import { ProgramFormatVersion, Instruction, ProgAction } from "../index.js";
import { MAX_INSTRUCTIONS } from "../constants/grid.js";

// LZMA compressor - clean interface with no environment detection
class LZMACompressor {
  static #lzmaInterface = null;

  static async getInterface() {
    if (!this.#lzmaInterface) {
      const { createLZMAInterface } = await import("../services/lzma-js-polyfill.js");
      this.#lzmaInterface = await createLZMAInterface();
    }
    return this.#lzmaInterface;
  }

  static async compress(data, compressionLevel = 7) {
    if (!data || data.length === 0) {
      throw new Error('Cannot compress empty data');
    }

    const lzma = await this.getInterface();
    return await lzma.compress(data, compressionLevel);
  }

  static async decompress(data) {
    if (!data || data.length === 0) {
      throw new Error('Cannot decompress empty data');
    }

    const lzma = await this.getInterface();
    return await lzma.decompress(data);
  }
}

/**
 * ProgramSerializer handles encoding/decoding of programs in Base64 v3 format
 * Based on C# ProgramSerializer.cs implementation
 * Enhanced with CyberChef algorithm support
 */
export class ProgramSerializer {
  /**
   * Probe the format version of encoded program data
   * @param {string} source - Encoded program string
   * @returns {number} Format version
   */
  static probeFormatVersion(source) {
    // Check for v3 text format (starts with $)
    if (source.startsWith("$")) {
      return ProgramFormatVersion.Version3;
    }

    // Check for v4 packed format (not implemented yet)
    if (source.length >= 2 && /^\d[\da-zA-Z/+]+={0,2}$/.test(source)) {
      const version = parseInt(source[0]);
      if (version === 4) {
        return ProgramFormatVersion.Packed;
      }
    }

    // Check for Codes format (space-separated numeric codes)
    if (/^\d+(\s+\d+)*$/.test(source.trim())) {
      return ProgramFormatVersion.Codes;
    }

    // Check for Base64 v3 format (LZMA compressed)
    if (/^[\da-zA-Z0-9/+]+={0,2}$/.test(source)) {
      return ProgramFormatVersion.Base64;
    }

    throw new Error(
      "Unsupported program format. Supported: Base64 v3, Version3 text format, Codes format."
    );
  }

  /**
   * Decode program from supported formats
   * @param {string} source - Encoded program
   * @returns {Promise<Array<Instruction>>} Array of instructions
   */
  static async decode(source) {
    const formatVersion = this.probeFormatVersion(source);

    switch (formatVersion) {
      case ProgramFormatVersion.Base64:
        return await this.decodeBase64(source);
      case ProgramFormatVersion.Version3:
        return this.decodeV3(source);
      case ProgramFormatVersion.Codes:
        return this.decodeCodes(source);
      default:
        throw new Error(`Unsupported format version: ${formatVersion}`);
    }
  }

  /**
   * Encode program to supported formats
   * @param {Array<Instruction>} instructions - Array of program instructions
   * @param {number} formatVersion - Format version (default: Base64)
   * @returns {Promise<string>} Encoded program
   */
  static async encode(
    instructions,
    formatVersion = ProgramFormatVersion.Base64
  ) {
    switch (formatVersion) {
      case ProgramFormatVersion.Base64:
        return await this.encodeBase64(instructions);
      case ProgramFormatVersion.Version3:
        return this.encodeV3(instructions);
      case ProgramFormatVersion.Codes:
        return this.encodeCodes(instructions);
      default:
        throw new Error(`Unsupported format version: ${formatVersion}`);
    }
  }

  /**
   * Decode Base64 v3 format (LZMA compressed)
   * Based on C# ProgramSerializer.DecodeV2 implementation
   * @param {string} source - Base64 encoded string
   * @returns {Promise<Array<Instruction>>} Array of instructions
   */
  static async decodeBase64(source) {
    try {
      this._validateBase64Input(source);

      // Decode Base64 and decompress LZMA
      const compressedData = this.base64Decode(source);
      const decompressedData = await LZMACompressor.decompress(compressedData);

      // Parse binary format: [length(4 bytes LE)][operators][labels(ASCII)]
      return this._parseDecompressedData(decompressedData);
    } catch (error) {
      throw new Error(`Failed to decode Base64 v3 program: ${error.message}`);
    }
  }

  /**
   * Validate Base64 input string
   * @param {string} source - Input string
   */
  static _validateBase64Input(source) {
    if (!source || typeof source !== 'string') {
      throw new Error('Invalid input: must be non-empty string');
    }
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(source)) {
      throw new Error('Invalid Base64 format');
    }
  }

  /**
   * Parse decompressed binary data into instructions
   * @param {Uint8Array} data - Decompressed data
   * @returns {Array<Instruction>} Instructions array
   */
  static _parseDecompressedData(data) {
    if (data.length < 4) {
      throw new Error('Data too short for length field');
    }

    // Read operators count
    const operatorsCount = this.readInt32LE(data, 0);
    if (operatorsCount < 0 || operatorsCount > data.length - 4) {
      throw new Error(`Invalid operators count: ${operatorsCount}`);
    }

    // Extract operators and labels
    const operators = data.slice(4, 4 + operatorsCount);
    const labelsString = this.arrayToAscii(data.slice(4 + operatorsCount));
    const labels = labelsString.toUpperCase().split(':');

    // Build instructions array
    const instructions = new Array(operatorsCount);
    for (let i = 0; i < operatorsCount; i++) {
      const action = operators[i];
      const labelInfo = this._parseLabel(labels[i] || '');
      instructions[i] = new Instruction(action, labelInfo.label, labelInfo.value);
    }

    return instructions;
  }

  /**
   * Parse label string in format "LABEL" or "LABEL@VALUE"
   * @param {string} labelStr - Label string
   * @returns {Object} {label, value}
   */
  static _parseLabel(labelStr) {
    if (!labelStr) return { label: '0', value: null };

    const parts = labelStr.split('@');
    if (parts.length > 2) {
      throw new Error(`Invalid label format: ${labelStr}`);
    }

    return {
      label: parts[0] || '0',
      value: parts.length === 2 ? parseInt(parts[1]) : null
    };
  }


  /**
   * Encode instructions to Base64 v3 format
   * Based on C# ProgramSerializer.EncodeV2 implementation
   * @param {Array<Instruction>} instructions - Array of instructions
   * @returns {Promise<string>} Base64 v3 encoded string
   */
  static async encodeBase64(instructions) {
    try {
      this._validateInstructions(instructions);


      // Build binary data: [length(4 bytes LE)][operators][labels(ASCII)]
      const binaryData = this._buildBinaryData(instructions);

      // Compress with LZMA
      const compressedData = await LZMACompressor.compress(binaryData, 7);

      // Encode to Base64
      const result = this.base64Encode(compressedData);

      return result;
    } catch (error) {
      throw new Error(`Failed to encode Base64 v3 program: ${error.message}`);
    }
  }

  /**
   * Validate instructions array
   * @param {Array<Instruction>} instructions - Instructions to validate
   */
  static _validateInstructions(instructions) {
    if (!Array.isArray(instructions)) {
      throw new Error('Instructions must be an array');
    }
    if (instructions.length === 0) {
      throw new Error('Instructions array cannot be empty');
    }
    if (instructions.length > MAX_INSTRUCTIONS) {
      throw new Error(`Too many instructions (max ${MAX_INSTRUCTIONS})`);
    }

    for (let i = 0; i < instructions.length; i++) {
      const inst = instructions[i];
      if (!inst || typeof inst.action !== 'number') {
        throw new Error(`Invalid instruction at index ${i}: missing or invalid action`);
      }
      if (inst.action < 0 || inst.action > 255) {
        throw new Error(`Invalid action code ${inst.action} at index ${i}: must be 0-255`);
      }
    }
  }

  /**
   * Build binary data from instructions
   * @param {Array<Instruction>} instructions - Instructions array
   * @returns {Uint8Array} Binary data
   */
  static _buildBinaryData(instructions) {
    // Build labels string
    const labelsString = instructions
      .map(inst => this._formatLabel(inst.label, inst.value))
      .join(':');

    // Calculate sizes
    const operatorsSize = instructions.length;
    const labelsSize = this.asciiToArray(labelsString).length;
    const totalSize = 4 + operatorsSize + labelsSize;

    // Build binary data
    const data = new Uint8Array(totalSize);

    // Write length (little endian)
    this.writeInt32LE(data, 0, instructions.length);

    // Write operators
    for (let i = 0; i < instructions.length; i++) {
      data[4 + i] = instructions[i].action;
    }

    // Write labels
    data.set(this.asciiToArray(labelsString), 4 + operatorsSize);

    return data;
  }

  /**
   * Format label for storage
   * @param {string} label - Label
   * @param {number} value - Value
   * @returns {string} Formatted label
   */
  static _formatLabel(label, value) {
    const labelStr = (label || '0').toUpperCase();
    return value !== null && value !== undefined ? `${labelStr}@${value}` : labelStr;
  }

  /**
   * Decode base64 string to Uint8Array
   * @param {string} str - Base64 string
   * @returns {Uint8Array} Decoded bytes
   */
  static base64Decode(str) {
    const binaryString = atob(str);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Encode Uint8Array to base64 string
   * @param {Uint8Array} bytes - Bytes to encode
   * @returns {string} Base64 string
   */
  static base64Encode(bytes) {
    let binaryString = "";
    for (let i = 0; i < bytes.length; i++) {
      binaryString += String.fromCharCode(bytes[i]);
    }
    return btoa(binaryString);
  }

  /**
   * Convert Uint8Array to ASCII string
   * @param {Uint8Array} array - Byte array
   * @returns {string} ASCII string
   */
  static arrayToAscii(array) {
    return String.fromCharCode.apply(null, array);
  }

  /**
   * Convert ASCII string to Uint8Array
   * @param {string} str - ASCII string
   * @returns {Uint8Array} Byte array
   */
  static asciiToArray(str) {
    const array = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      array[i] = str.charCodeAt(i);
    }
    return array;
  }

  /**
   * Read 32-bit integer in little endian format
   * @param {Uint8Array} buffer - Buffer to read from
   * @param {number} offset - Offset in buffer
   * @returns {number} Integer value
   */
  static readInt32LE(buffer, offset) {
    return (
      (buffer[offset + 3] << 24) |
      (buffer[offset + 2] << 16) |
      (buffer[offset + 1] << 8) |
      buffer[offset]
    );
  }


  /**
   * Write 32-bit integer in little endian format
   * @param {Uint8Array} buffer - Buffer to write to
   * @param {number} offset - Offset in buffer
   * @param {number} value - Value to write
   */
  static writeInt32LE(buffer, offset, value) {
    buffer[offset] = value & 0xff;
    buffer[offset + 1] = (value >> 8) & 0xff;
    buffer[offset + 2] = (value >> 16) & 0xff;
    buffer[offset + 3] = (value >> 24) & 0xff;
  }

  /**
   * Decode Version3 text format
   * Based on C# DecodeV3 method
   * @param {string} source - Text format string (starts with $)
   * @returns {Array<Instruction>} Array of instructions
   */
  static decodeV3(source) {
    // Remove $ prefix if present
    if (source.startsWith("$")) {
      source = source.substring(1);
    }

    // Convert compressed format back to full grid
    source = source
      .replace(/\.\d\./g, (match) => {
        const count = parseInt(match[1]);
        return " ".repeat(count * 12); // 12 spaces per line
      })
      .replace(/\./g, " ".repeat(12)) // Single dot = 12 spaces
      .replace(/_/g, "   "); // _ = 3 spaces

    const instructions = [];
    let col = 0;
    let row = 0;

    // Parse the text grid
    for (let i = 0; i < source.length && instructions.length < 192; i++) {
      const char = source[i];

      if (char === " ") {
        // None instruction
        instructions.push(new Instruction(ProgAction.None, null, null));
        col++;
      } else if (char === ",") {
        // NextLine - fill rest of line with None
        while (col < 16) {
          instructions.push(new Instruction(ProgAction.None, null, null));
          col++;
        }
        col = 0;
        row++;
      } else if (char === "~") {
        // Page break - fill rest of page with None
        while (instructions.length < 192) {
          instructions.push(new Instruction(ProgAction.None, null, null));
        }
      } else {
        // Find matching action
        const actionCode = this.findActionBySymbol(char, source, i);
        if (actionCode !== null) {
          instructions.push(new Instruction(actionCode, null, null));
          col++;
          // Skip additional characters if multi-char symbol
          if (actionCode >= 100) i++; // Skip semicolon for commands like "CW;"
        } else {
          instructions.push(new Instruction(ProgAction.None, null, null));
          col++;
        }
      }

      if (col >= 16) {
        col = 0;
        row++;
      }
    }

    // Fill remaining with None
    while (instructions.length < 192) {
      instructions.push(new Instruction(ProgAction.None, null, null));
    }

    return instructions;
  }

  /**
   * Decode Codes format (space-separated numeric action codes)
   * @param {string} source - Codes format string
   * @returns {Array<Instruction>} Array of instructions
   */
  static decodeCodes(source) {
    const instructions = [];
    const codes = source
      .trim()
      .split(/\s+/)
      .map((code) => parseInt(code.trim()));

    for (const code of codes) {
      if (!isNaN(code) && code >= 0 && code <= 255) {
        instructions.push(new Instruction(code, null, null));
      } else {
        throw new Error(`Invalid action code: ${code}`);
      }
    }

    return instructions;
  }

  /**
   * Encode to Codes format (space-separated numeric action codes)
   * @param {Array<Instruction>} instructions - Array of instructions
   * @returns {string} Codes format string
   */
  static encodeCodes(instructions) {
    return instructions
      .filter((inst) => inst.action !== ProgAction.None)
      .map((inst) => inst.action)
      .join(" ");
  }

  /**
   * Encode to Version3 text format
   * Based on C# EncodeV3 method
   * @param {Array<Instruction>} instructions - Array of instructions
   * @returns {string} Version3 text format
   */
  static encodeV3(instructions) {
    let sb = "";
    let spacesBacktrack = 0;
    let linesBacktrack = 0;

    for (let i = 0; i < instructions.length; i++) {
      const col = i % 16;
      const row = Math.floor(i / 16) % 12;

      if (instructions[i].action !== ProgAction.None) {
        linesBacktrack = spacesBacktrack = 0;
      }

      switch (instructions[i].action) {
        case ProgAction.None:
          sb += " ";
          spacesBacktrack++;
          break;
        case ProgAction.NextLine:
          sb += ",";
          break;
        case ProgAction.SetStart:
          sb += "#S";
          break;
        case ProgAction.Terminate:
          sb += "#E";
          break;
        case ProgAction.MoveUp:
          sb += "^W";
          break;
        case ProgAction.MoveLeft:
          sb += "^A";
          break;
        case ProgAction.MoveDown:
          sb += "^S";
          break;
        case ProgAction.MoveRight:
          sb += "^D";
          break;
        case ProgAction.Dig:
          sb += "z";
          break;
        case ProgAction.RotateUp:
          sb += "w";
          break;
        case ProgAction.RotateLeft:
          sb += "a";
          break;
        case ProgAction.RotateDown:
          sb += "s";
          break;
        case ProgAction.RotateRight:
          sb += "d";
          break;
        case ProgAction.RepeatLastAction:
          sb += "l";
          break;
        case ProgAction.MoveForward:
          sb += "^F";
          break;
        case ProgAction.RotateLefthand:
          sb += "CCW;";
          break;
        case ProgAction.RotateRighthand:
          sb += "CW;";
          break;
        case ProgAction.BuildBlock:
          sb += "b";
          break;
        case ProgAction.UseGeo:
          sb += "g";
          break;
        case ProgAction.BuildRoad:
          sb += "r";
          break;
        case ProgAction.Heal:
          sb += "h";
          break;
        case ProgAction.BuildQuadro:
          sb += "q";
          break;
        case ProgAction.RotateRandom:
          sb += "RAND;";
          break;
        case ProgAction.PlaySound:
          sb += "BEEP;";
          break;
        // Add more cases as needed
        default:
          sb += " ";
          break;
      }

      if (col === 15) {
        // End of line - collapse spaces
        if (spacesBacktrack > 0) {
          sb = sb.substring(0, sb.length - spacesBacktrack);
          if (spacesBacktrack >= 12) {
            sb += ".";
          } else {
            sb += " ".repeat(spacesBacktrack);
          }
        }
        sb += "\n";
        linesBacktrack++;
        spacesBacktrack = 0;

        if (row === 11) {
          // End of page - collapse lines
          if (linesBacktrack > 0) {
            sb = sb.substring(0, sb.length - linesBacktrack);
            sb += "~";
          }
          linesBacktrack = 0;
        }
      }
    }

    // Compress spaces
    sb = sb.replace(/ {12}/g, ".");
    sb = sb.replace(/ {3}/g, "_");

    return "$" + sb;
  }

  /**
   * Find action code by symbol
   * @param {string} char - Character
   * @param {string} source - Full source string
   * @param {number} index - Current index
   * @returns {number|null} Action code or null
   */
  static findActionBySymbol(char, source, index) {
    const symbolMap = {
      "^W": ProgAction.MoveUp,
      "^A": ProgAction.MoveLeft,
      "^S": ProgAction.MoveDown,
      "^D": ProgAction.MoveRight,
      "^F": ProgAction.MoveForward,
      w: ProgAction.RotateUp,
      a: ProgAction.RotateLeft,
      s: ProgAction.RotateDown,
      d: ProgAction.RotateRight,
      z: ProgAction.Dig,
      b: ProgAction.BuildBlock,
      g: ProgAction.UseGeo,
      r: ProgAction.BuildRoad,
      h: ProgAction.Heal,
      q: ProgAction.BuildQuadro,
      l: ProgAction.RepeatLastAction,
      "#S": ProgAction.SetStart,
      "#E": ProgAction.Terminate,
      ",": ProgAction.NextLine,
    };

    // Check multi-character symbols first
    for (const [symbol, action] of Object.entries(symbolMap)) {
      if (
        symbol.length > 1 &&
        source.substring(index, index + symbol.length) === symbol
      ) {
        return action;
      }
    }

    // Check single characters
    return symbolMap[char] || null;
  }
}
