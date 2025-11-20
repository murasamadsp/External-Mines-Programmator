if (
  typeof globalThis !== "undefined" &&
  typeof globalThis.process === "undefined"
) {
  globalThis.process = { env: { NODE_ENV: "production" } };
}

const isBrowserEnvironment = typeof window !== "undefined";

const basePublicPath = isBrowserEnvironment
  ? `${(
      (typeof import.meta !== "undefined" &&
        import.meta.env &&
        import.meta.env.BASE_URL) ||
      ""
    ).replace(/\/?$/, "/")}`
  : null;

const browserLzmaBasePath = basePublicPath
  ? `${basePublicPath}vendor/lzma/`
  : null;
const browserScriptUrl = browserLzmaBasePath
  ? `${browserLzmaBasePath}lzma_worker.js`
  : null;

const browserScriptPromises = new Map();
let browserLzmaInstancePromise = null;

function loadBrowserScript(src) {
  if (!src) {
    return Promise.reject(new Error("Browser LZMA script path is not defined"));
  }
  if (!browserScriptPromises.has(src)) {
    browserScriptPromises.set(
      src,
      new Promise((resolve, reject) => {
        const existing = document.querySelector(
          `script[data-lzma-src="${src}"]`
        );
        if (existing) {
          if (existing.dataset.loaded === "true") {
            resolve();
            return;
          }
          existing.addEventListener("load", () => resolve(), { once: true });
          existing.addEventListener(
            "error",
            () => reject(new Error(`Failed to load LZMA script at ${src}`)),
            { once: true }
          );
          return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.dataset.lzmaSrc = src;
        let previousExports;
        let hadExports = false;
        let previousModule;
        let hadModule = false;
        if (typeof window !== "undefined") {
          if ("exports" in window) {
            hadExports = true;
            previousExports = window.exports;
          }
          if ("module" in window) {
            hadModule = true;
            previousModule = window.module;
          }
          window.exports = {};
          window.module = { exports: window.exports };
        }
        script.addEventListener("load", () => {
          if (typeof window !== "undefined") {
            const exportedModule =
              window.LZMA ||
              window.module?.exports?.default ||
              window.module?.exports?.LZMA ||
              window.module?.exports;
            if (exportedModule && !window.LZMA) {
              const ctor =
                exportedModule.default || exportedModule.LZMA || exportedModule;
              window.LZMA = ctor;
            }
            if (hadExports) {
              window.exports = previousExports;
            } else {
              delete window.exports;
            }
            if (hadModule) {
              window.module = previousModule;
            } else {
              delete window.module;
            }
          }
          script.dataset.loaded = "true";
          resolve();
        });
        script.addEventListener("error", () => {
          if (typeof window !== "undefined") {
            if (hadExports) {
              window.exports = previousExports;
            } else {
              delete window.exports;
            }
            if (hadModule) {
              window.module = previousModule;
            } else {
              delete window.module;
            }
          }
          reject(new Error(`Failed to load LZMA script at ${src}`));
        });
        document.head.appendChild(script);
      })
    );
  }
  return browserScriptPromises.get(src);
}

async function getBrowserLzmaInstance() {
  if (browserLzmaInstancePromise) {
    return browserLzmaInstancePromise;
  }
  browserLzmaInstancePromise = (async () => {
    if (!browserScriptUrl) {
      throw new Error("LZMA browser assets are not available");
    }
    await loadBrowserScript(browserScriptUrl);
    if (typeof window === "undefined" || typeof window.LZMA !== "function") {
      throw new Error(
        "Global LZMA constructor is not available after loading script"
      );
    }
    return new window.LZMA();
  })();
  return browserLzmaInstancePromise;
}

// LZMA interface - unified API for different environments
// Uses lzma-web in browsers

class LZMAInterface {
  constructor(impl) {
    this.impl = impl;
  }

  async compress(data, level = 7) {
    if (!this.impl) {
      throw new Error("LZMA implementation not available");
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
      throw new Error("LZMA implementation not available");
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
    throw new Error("Unsupported data type for LZMA operation");
  }

  async _compressImpl(data, level) {
    throw new Error("_compressImpl must be implemented by subclass");
  }

  async _decompressImpl(data) {
    throw new Error("_decompressImpl must be implemented by subclass");
  }
}

class LZMAWebInterface extends LZMAInterface {
  async _compressImpl(data, level) {
    return new Promise((resolve, reject) => {
      const onFinish = (result, error) => {
        if (error) {
          reject(
            new Error(
              typeof error === "string"
                ? error
                : error?.message || "LZMA compression failed"
            )
          );
          return;
        }
        resolve(result);
      };
      try {
        this.impl.compress(data, level, onFinish);
      } catch (err) {
        reject(err);
      }
    });
  }

  async _decompressImpl(data) {
    return new Promise((resolve, reject) => {
      const onFinish = (result, error) => {
        if (error) {
          reject(
            new Error(
              typeof error === "string"
                ? error
                : error?.message || "LZMA decompression failed"
            )
          );
          return;
        }
        resolve(result);
      };
      try {
        this.impl.decompress(data, onFinish);
      } catch (err) {
        reject(err);
      }
    });
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
    if (isBrowserEnvironment) {
      console.log("🔧 Initializing LZMA in browser (main thread)...");
      const lzmaInstance = await getBrowserLzmaInstance();
      console.log("✅ LZMA browser ready (main thread)");
      return new LZMAWebInterface(lzmaInstance);
    }

    throw new Error("LZMA assets are only available in browser environments");
  } catch (error) {
    console.error("❌ Failed to initialize LZMA:", error);
    throw new Error(`LZMA initialization failed: ${error.message}`);
  }
}

export { createLZMAInterface };
