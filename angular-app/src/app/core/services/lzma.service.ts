import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface LZMAInterface {
  compress(
    data: Uint8Array | number[],
    level: number,
    callback: (result: number[] | Uint8Array, error?: string | Error) => void,
  ): void;
  decompress(
    data: Uint8Array | number[],
    callback: (result: number[] | Uint8Array | string, error?: string | Error) => void,
  ): void;
}

interface WindowWithLZMA extends Window {
  LZMA?: LZMAInterface;
  exports?: Record<string, unknown>;
  module?: { exports: Record<string, unknown> };
}

@Injectable({
  providedIn: 'root',
})
export class LzmaService {
  private lzmaInstance: LZMAInterface | null = null;
  private lzmaPromise: Promise<LZMAInterface> | null = null;
  private readonly platformId = inject(PLATFORM_ID);

  private async getLzmaInstance(): Promise<LZMAInterface> {
    if (this.lzmaInstance) {
      return this.lzmaInstance;
    }

    if (this.lzmaPromise) {
      return this.lzmaPromise;
    }

    this.lzmaPromise = (async () => {
      if (isPlatformBrowser(this.platformId)) {
        const win = window as WindowWithLZMA;
        // Check if LZMA is already available
        if (win.LZMA) {
          // LZMA is already loaded, use it directly
          this.lzmaInstance = win.LZMA;
          return this.lzmaInstance;
        }

        // Load lzma_worker.js directly (creates global LZMA object)
        const workerScript = '/vendor/lzma/lzma_worker.js';
        await this.loadScript(workerScript);

        // Wait a bit for LZMA to be available
        let attempts = 0;
        const maxAttempts = 20;
        while (!win.LZMA && attempts < maxAttempts) {
          await new Promise<void>((resolve) => setTimeout(resolve, 50));
          attempts++;
        }

        if (win.LZMA) {
          // Use the global LZMA object directly
          this.lzmaInstance = win.LZMA;
          return this.lzmaInstance;
        } else {
          throw new Error('LZMA global not found after loading script');
        }
      } else {
        // Server-side logic (if needed, or just reject)
        // For now, we assume browser-only for this part or use a node library if SSR is needed
        throw new Error('LZMA not supported on server yet');
      }
    })();

    return this.lzmaPromise;
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(`script[data-lzma-src="${src}"]`);
      if (existing) {
        if (existing.dataset['loaded'] === 'true') {
          resolve();
          return;
        }
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener(
          'error',
          () => reject(new Error(`Failed to load LZMA script at ${src}`)),
          { once: true },
        );
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.dataset['lzmaSrc'] = src;

      const win = window as WindowWithLZMA;
      // Polyfill for exports/module to support CommonJS-style scripts in browser
      let previousExports: Record<string, unknown> | undefined;
      let hadExports = false;
      let previousModule: { exports: Record<string, unknown> } | undefined;
      let hadModule = false;

      if ('exports' in window) {
        hadExports = true;
        previousExports = win.exports;
      }
      if ('module' in window) {
        hadModule = true;
        previousModule = win.module;
      }
      win.exports = {};
      win.module = { exports: win.exports };

      script.addEventListener('load', () => {
        // Extract LZMA from various possible locations
        const exportedModule =
          win.LZMA ||
          (win.module?.exports?.['default'] as LZMAInterface | undefined) ||
          (win.module?.exports?.['LZMA'] as LZMAInterface | undefined) ||
          (win.module?.exports as LZMAInterface | undefined);

        if (exportedModule && !win.LZMA) {
          const ctor = (exportedModule as { default?: LZMAInterface }).default || exportedModule;
          win.LZMA = ctor as LZMAInterface;
        }

        // Restore previous exports/module
        if (hadExports) {
          win.exports = previousExports;
        } else {
          delete win.exports;
        }
        if (hadModule) {
          win.module = previousModule;
        } else {
          delete win.module;
        }

        script.dataset['loaded'] = 'true';
        resolve();
      });

      script.addEventListener('error', () => {
        // Restore previous exports/module on error
        if (hadExports) {
          win.exports = previousExports;
        } else {
          delete win.exports;
        }
        if (hadModule) {
          win.module = previousModule;
        } else {
          delete win.module;
        }
        reject(new Error(`Failed to load LZMA script at ${src}`));
      });

      document.head.appendChild(script);
    });
  }

  async compress(data: Uint8Array | string, level = 7): Promise<Uint8Array> {
    const lzma = await this.getLzmaInstance();

    // Ensure data is Uint8Array
    const uint8Data = data instanceof Uint8Array ? data : new TextEncoder().encode(data);

    return new Promise<Uint8Array>((resolve, reject) => {
      try {
        lzma.compress(uint8Data, level, (result: number[] | Uint8Array, error?: string | Error) => {
          if (error) {
            reject(
              new Error(
                typeof error === 'string' ? error : error?.message || 'LZMA compression failed',
              ),
            );
            return;
          }
          resolve(new Uint8Array(result));
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  async decompress(data: Uint8Array): Promise<Uint8Array> {
    const lzma = await this.getLzmaInstance();

    // Ensure data is Uint8Array
    const uint8Data = data instanceof Uint8Array ? data : new Uint8Array(data);

    return new Promise<Uint8Array>((resolve, reject) => {
      try {
        lzma.decompress(
          uint8Data,
          (result: number[] | Uint8Array | string, error?: string | Error) => {
            if (error) {
              reject(
                new Error(
                  typeof error === 'string' ? error : error?.message || 'LZMA decompression failed',
                ),
              );
              return;
            }
            // result can be string or array
            if (typeof result === 'string') {
              resolve(new TextEncoder().encode(result));
            } else {
              resolve(new Uint8Array(result));
            }
          },
        );
      } catch (err) {
        reject(err);
      }
    });
  }
}
