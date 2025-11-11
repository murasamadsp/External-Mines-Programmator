// LZMA-JS polyfill for browser compatibility
// This file loads LZMA-JS library for use in ES modules

// Load LZMA core
import LZMA_CORE from 'lzma-js/src/lzma.js';
import LZMA_SHIM from 'lzma-js/src/lzma.shim.js';

// Make LZMA available globally
window.LZMA = LZMA_CORE;

// Apply shim for stream classes
LZMA_SHIM(LZMA_CORE);
