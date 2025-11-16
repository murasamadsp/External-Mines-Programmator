const browserWorkerUrl =
  typeof window !== "undefined"
    ? `${(
        (typeof import.meta !== "undefined" &&
        import.meta.env &&
        import.meta.env.BASE_URL) ||
        "/"
      ).replace(/\/?$/, "/")}lzma_worker.js`
    : null;

// LZMA interface - unified API for different environments
// Uses lzma-web in browsers and lzma-native in Node.js

class LZMAInterface {
  constructor(impl) {
    this.impl = impl;
  }

  async compress(data, level = 7) {
    if (!this.impl) {
      throw new Error('LZMA implementation not available');
    }

    // Ensure data is Uint8Array
    const uint8Data = this._toUint8Array(data);

    // Compress using implementation-specific method
    const result = await this._compressImpl(uint8Data, level);

    // Ensure result is Uint8Array
    return this._toUint8Array(result);
  }

  async decompress(data) {
    if (!this.impl) {
      throw new Error('LZMA implementation not available');
    }

    // Ensure data is Uint8Array
    const uint8Data = this._toUint8Array(data);

    // Decompress using implementation-specific method
    const result = await this._decompressImpl(uint8Data);

    // Ensure result is Uint8Array
    return this._toUint8Array(result);
  }

  _toUint8Array(data) {
    if (data instanceof Uint8Array) {
      return data;
    }
    if (typeof Buffer !== "undefined" && data instanceof Buffer) {
      return new Uint8Array(data);
    }
    if (data instanceof ArrayBuffer) {
      return new Uint8Array(data);
    }
    if (Array.isArray(data)) {
      return new Uint8Array(data);
    }
    if (typeof data === "string") {
      const encoder = new TextEncoder();
      return encoder.encode(data);
    }
    throw new Error('Unsupported data type for LZMA operation');
  }

  async _compressImpl(data, level) {
    throw new Error('_compressImpl must be implemented by subclass');
  }

  async _decompressImpl(data) {
    throw new Error('_decompressImpl must be implemented by subclass');
  }
}

class LZMAWebInterface extends LZMAInterface {
  async _compressImpl(data, level) {
    return await this.impl.compress(data, level);
  }

  async _decompressImpl(data) {
    const result = await this.impl.decompress(data);
    return this._toUint8Array(result);
  }
}

class LZMANativeInterface extends LZMAInterface {
  async _compressImpl(data, level) {
    return await this.impl.compress(data, level);
  }

  async _decompressImpl(data) {
    return await this.impl.decompress(data);
  }
}

// Factory function to create appropriate LZMA interface
async function createLZMAInterface() {
  try {
    if (typeof window !== 'undefined') {
      console.log('🔧 Initializing lzma-web for browser...');
      if (!browserWorkerUrl) {
        throw new Error('Failed to create LZMA worker URL');
      }
      const { default: LZMA } = await import('lzma-web');
      const lzmaInstance = new LZMA(browserWorkerUrl);
      console.log('✅ lzma-web initialized successfully');
      return new LZMAWebInterface(lzmaInstance);
    }

    // Node.js environment
    console.log('🔧 Initializing LZMA for Node.js...');
    const lzmaNative = await import('lzma-native');
    const nativeImpl = {
      compress: (data, level) => lzmaNative.LZMA().compress(data, level),
      decompress: (data) => lzmaNative.LZMA().decompress(data)
    };
    console.log('✅ LZMA-Native initialized successfully');
    return new LZMANativeInterface(nativeImpl);
  } catch (error) {
    console.error('❌ Failed to initialize LZMA:', error);
    throw new Error(`LZMA initialization failed: ${error.message}`);
  }
}

export { createLZMAInterface };
