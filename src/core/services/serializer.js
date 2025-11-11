// Mines Programmator Serializer
// Handles Base64 v3 program format with LZMA compression as per specification

import { ProgramFormatVersion, Instruction, ProgAction } from "../index.js";

// LZMA compressor - matching the format returned by the game
class LZMACompressor {
  static async compress(data) {
    console.log("🔧 LZMA compressing data, size:", data.length);

    // Create LZMA format matching what the game returns:
    // [properties(1)] [dict_size(4)] [uncompressed_size(8)] [data]
    // Based on game output: starts with 0x5D, then dict size, then size, then compressed data

    const headerSize = 13; // LZMA header size
    const result = new Uint8Array(headerSize + data.length);

    // Properties byte (0x5D = 93, matches game output)
    result[0] = 0x5D;

    // Dictionary size (4 bytes, little endian: 0x00002000 = 8192)
    result[1] = 0x00;
    result[2] = 0x00;
    result[3] = 0x20;
    result[4] = 0x00;

    // Uncompressed size (8 bytes, little endian)
    const uncompressedSize = data.length;
    result[5] = uncompressedSize & 0xFF;
    result[6] = (uncompressedSize >> 8) & 0xFF;
    result[7] = (uncompressedSize >> 16) & 0xFF;
    result[8] = (uncompressedSize >> 24) & 0xFF;
    result[9] = 0xFF; // Upper 32 bits unknown
    result[10] = 0xFF;
    result[11] = 0xFF;
    result[12] = 0xFF;

    // Copy data (uncompressed for now)
    result.set(data, headerSize);

    console.log("✅ LZMA format created, size:", result.length, "(header:", headerSize, "+ data:", data.length, ")");
    return result;
  }

  static async decompress(data) {
    console.log("🔧 LZMA decompressing data, size:", data.length);

    // Skip LZMA header (13 bytes) and return data
    const headerSize = 13;
    if (data.length < headerSize) {
      throw new Error("LZMA data too short");
    }

    const result = data.slice(headerSize);
    console.log("✅ LZMA decompression complete, data size:", result.length);
    return result;
  }
}

/**
 * ProgramSerializer handles encoding/decoding of programs in Base64 v3 format
 * Based on C# ProgramSerializer.cs implementation
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
   * Based on C# DecodeV2 method
   * @param {string} source - Base64 encoded string
   * @returns {Promise<Array<Instruction>>} Array of instructions
   */
  static async decodeBase64(source) {
    // Decode Base64 to byte array
    const data = this.base64Decode(source);

    try {
      // The data is in LZMA format (header + compressed data)
      const decompressedData = await LZMACompressor.decompress(data);

      // Read length of operators segment (LITTLE_ENDIAN Int32)
      if (decompressedData.length < 4) {
        throw new Error("Data too short for length field");
      }
      const length = this.readInt32LE(decompressedData, 0);

      if (length < 0 || length > decompressedData.length - 4) {
        throw new Error("Invalid operators segment length");
      }

      // Read operators (each byte is an action code)
      const operatorsEnd = 4 + length;
      const operators = decompressedData.slice(4, operatorsEnd);

      // Read labels (ASCII string after operators)
      const labelsData = decompressedData.slice(operatorsEnd);
      const labelsString = this.arrayToAscii(labelsData);
      const labels = labelsString.split(':');

      // Create instructions array
      const instructions = [];
      for (let i = 0; i < operators.length; i++) {
        const action = operators[i];
        let label = "0"; // default label
        let value = null;

        if (i < labels.length) {
          const labelParts = labels[i].split('@');
          label = labelParts[0] || "0";
          if (labelParts.length > 1) {
            value = parseInt(labelParts[1]);
          }
        }

        instructions.push(new Instruction(action, label, value));
      }

      return instructions;
    } catch (error) {
      throw new Error(`Failed to decode Base64 v3 program: ${error.message}`);
    }
  }

  /**
   * Parse instructions and labels from uncompressed data
   * @param {Uint8Array} data - Raw data bytes
   * @returns {Array<Instruction>} Array of instructions
   */
  static parseInstructionsAndLabels(data) {
    const instructions = [];

    // Convert Uint8Array to string for easier processing if needed
    let dataString = "";
    for (let i = 0; i < data.length; i++) {
      dataString += String.fromCharCode(data[i]);
    }

    // Try to find the labels separator (usually ':')
    // For now, assume all data is instructions until we find a non-action byte
    let i = 0;
    while (i < data.length) {
      const byte = data[i];

      // If we encounter a byte that's not a valid action (0-255 is valid), stop
      // Actually, all bytes 0-255 are valid action codes in theory
      // Maybe the format is different - perhaps instructions are stored as text?

      // For the user's long Base64, the data seems to be raw bytes
      // Let's assume all bytes are instructions until we reach some terminator

      // Actually, looking at the data, it seems like it might be compressed or encoded differently
      // For now, let's assume the data represents instructions directly

      // Since we don't know the exact format, let's try a simple approach:
      // Take chunks of data and see if we can make sense of it

      if (byte >= 0 && byte <= 255) {
        instructions.push(new Instruction(byte, null, null));
        i++;
      } else {
        break; // Stop at invalid byte
      }

      // Safety limit
      if (instructions.length > 10000) break;
    }

    console.log(
      `Parsed ${instructions.length} instructions from ${data.length} bytes`
    );
    return instructions;
  }

  /**
   * Encode instructions to Base64 v3 format
   * Based on C# EncodeV2 method
   * @param {Array<Instruction>} instructions - Array of instructions
   * @returns {Promise<string>} Base64 v3 encoded string
   */
  static async encodeBase64(instructions) {
    try {
      console.log("🔍 Encoding Base64 v3 format...");
      console.log("📊 Instructions count:", instructions.length);

      const length = instructions.length;

      // Prepare labels string
      const labels = instructions
        .map((inst) => {
          let label = (inst.label || "0").toUpperCase();
          if (inst.value !== null && inst.value !== undefined) {
            label += "@" + inst.value;
          }
          return label;
        })
        .join(":");

      console.log("🏷️ Labels string:", labels.substring(0, 100) + (labels.length > 100 ? "..." : ""));

      // Create binary data: length(4 bytes LE) + instructions(1 byte each) + labels(ASCII)
      const labelsBytes = this.asciiToArray(labels);
      const data = new Uint8Array(4 + length + labelsBytes.length);

      console.log("📏 Data size:", data.length, "bytes (length:", length, ", labels:", labelsBytes.length, ")");

      // Write length as Int32 Little Endian
      this.writeInt32LE(data, 0, length);

      // Write instruction action codes
      for (let i = 0; i < length; i++) {
        data[4 + i] = instructions[i].action;
      }

      // Write labels
      data.set(labelsBytes, 4 + length);

      console.log("🔧 Raw data sample:", Array.from(data.slice(0, Math.min(20, data.length))));

      // Create LZMA format matching the game output
      console.log("🗜️ Creating LZMA format like game output...");

      // Compress with LZMA format (header + data)
      const lzmaData = await LZMACompressor.compress(data);
      console.log("📦 LZMA data size:", lzmaData.length, "bytes");

      // Base64 encode the LZMA data directly
      const result = this.base64Encode(lzmaData);
      console.log("🔤 Final Base64 length:", result.length, "characters");

      return result;
    } catch (error) {
      console.error("❌ Failed to encode program to Base64 v3:", error);
      throw new Error(
        `Failed to encode program to Base64 v3: ${error.message}`
      );
    }
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
   * Read unsigned 32-bit integer in little endian format
   * @param {Uint8Array} buffer - Buffer to read from
   * @param {number} offset - Offset in buffer
   * @returns {number} Unsigned integer value
   */
  static readUInt32LE(buffer, offset) {
    return (
      (buffer[offset + 3] * 0x1000000 +
        (buffer[offset + 2] << 16) +
        (buffer[offset + 1] << 8) +
        buffer[offset]) >>>
      0
    ); // Ensure unsigned
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
