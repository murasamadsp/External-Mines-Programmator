// Ensure process exists for browser build (needed by lzma-web)
if (typeof globalThis.process === "undefined") {
  globalThis.process = { env: { NODE_ENV: "production" } };
}

// LZMA interface - unified API for different environments
// Uses CDN lzma-js for browser and lzma-native for Node.js

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

class LZMAJSInterface extends LZMAInterface {
  async _compressImpl(data, level) {
    const result = await this.impl.compress(data, level);
    return this._toUint8Array(result);
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

const LZMA_JS_BASE = 'https://cdn.jsdelivr.net/npm/lzma-js@1.0.1/src';
let lzmaLoadPromise = null;

function loadScriptOnce(src) {
  if (document.querySelector(`script[src="${src}"]`)) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = (err) => reject(new Error(`Failed to load ${src}: ${err.message}`));
    document.head.appendChild(script);
  });
}

// Factory function to create appropriate LZMA interface
async function createLZMAInterface() {
  try {
    if (typeof window !== 'undefined') {
      console.log('🔧 Initializing lzma-js for browser...');
      if (!lzmaLoadPromise) {
        lzmaLoadPromise = (async () => {
          await loadScriptOnce(`${LZMA_JS_BASE}/lzma.js`);
          await loadScriptOnce(`${LZMA_JS_BASE}/lzma.shim.js`);
          if (!window.LZMA) {
            throw new Error('window.LZMA is undefined after loading scripts');
          }
          return window.LZMA;
        })();
      }
      const LZMA_CORE = await lzmaLoadPromise;

      if (!LZMA_CORE || typeof LZMA_CORE.iStream !== 'function' || typeof LZMA_CORE.oStream !== 'function') {
        console.error('LZMA object:', LZMA_CORE);
        throw new Error('LZMA-JS module is not properly loaded');
      }

      console.log('✅ lzma-js initialized successfully');
      return new LZMAJSInterface(LZMA_CORE);
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
