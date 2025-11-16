// LZMA interface - unified API for different environments
// Uses LZMA-Web for browser and lzma-native for Node.js

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
    // LZMA-Web compress returns Promise<Uint8Array>
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
    // Browser environment
    if (typeof window !== 'undefined') {
      console.log('🔧 Initializing LZMA-Web for browser...');

      if (typeof process === 'undefined') {
        globalThis.process = { env: { NODE_ENV: 'production' } };
      }

      // Import LZMA-Web
      const { default: LZMAWeb } = await import('lzma-web');
      const lzmaInstance = new LZMAWeb();

      // Validate that LZMA-Web instance has required methods
      if (!lzmaInstance || typeof lzmaInstance.compress !== 'function' || typeof lzmaInstance.decompress !== 'function') {
        console.error('LZMA-Web instance:', lzmaInstance);
        console.error('Has compress:', typeof lzmaInstance?.compress);
        console.error('Has decompress:', typeof lzmaInstance?.decompress);
        throw new Error('LZMA-Web instance is not properly created');
      }

      console.log('✅ LZMA-Web initialized successfully');
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
