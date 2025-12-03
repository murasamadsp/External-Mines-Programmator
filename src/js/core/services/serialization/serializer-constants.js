// Constants and mappings for Mines Programmator serialization (LZMA Base64 only)
export const MODERN_PAGE_WIDTH = 16;
export const MODERN_PAGE_HEIGHT = 12;
export const MODERN_PAGE_SIZE = MODERN_PAGE_WIDTH * MODERN_PAGE_HEIGHT;

export const ASCII_ENCODER = new TextEncoder();
export const ASCII_DECODER = new TextDecoder("utf-8", { fatal: false });

export const ALPHABET =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
