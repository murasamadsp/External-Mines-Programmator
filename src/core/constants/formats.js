// Program Format Version enum - based on official ProgramFormatVersion.cs
export const ProgramFormatVersion = {
  Base64: 1, // Base64 v3 format with LZMA compression
  Version3: 2, // Text-based v3 format with symbols like ^W, ^A, etc.
  Codes: 3, // Simple space-separated numeric action codes (for Mines compatibility)
};
