// LZMA Compression Utilities for Mines Programmator
// Handles LZMA compression and decompression operations

export class LZMACompressor {
  static #lzmaInterface = null;

  static async getInterface() {
    if (!this.#lzmaInterface) {
      try {
        console.log("🔧 Loading LZMA interface...");
        const { createLZMAInterface } = await import("./lzma-js-polyfill.js");
        this.#lzmaInterface = await createLZMAInterface();
        console.log("✅ LZMA interface loaded successfully");
      } catch (error) {
        console.error("❌ LZMA not available:", error.message);
        throw new Error(
          "LZMA compression library is required but failed to load. Please check your connection or build configuration.",
        );
      }
    }
    return this.#lzmaInterface;
  }

  static async compress(data, level = 7) {
    if (!data || !data.length) {
      throw new Error("Cannot compress empty payload");
    }
    const lzma = await this.getInterface();
    return await lzma.compress(data, level);
  }

  static async decompress(data) {
    if (!data || !data.length) {
      throw new Error("Cannot decompress empty payload");
    }
    const lzma = await this.getInterface();
    return lzma.decompress(data);
  }
}
