// Program Format Version enum - based on official ProgramFormatVersion.cs
export const ProgramFormatVersion = {
  Version1: 0, // Original text-based format (default)
  Base64: 1, // Base64 v2 format with LZMA compression
  Version3: 2, // Text-based v3 format with symbols like ^W, ^A, etc.
  Packed: 3, // V4 packed format (not implemented)
};
