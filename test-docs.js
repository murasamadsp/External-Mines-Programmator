// Simple LZMA functionality test
console.log("Testing LZMA functionality in browser environment");

// Simple test data
const testData = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
console.log("Original test data:", Array.from(testData));

// Test LZMA functionality after a delay to allow loading
setTimeout(() => {
  if (typeof window !== "undefined" && window.LZMA && window.LZMA.encode) {
    (() => {
      try {
        console.log("\n--- Testing LZMA compression directly ---");

        // Create input stream
        const input = new window.LZMA.iStream(testData.buffer);
        const output = new window.LZMA.oStream();

        // Compress with mode 7
        window.LZMA.encode(input, output, 7);
        const compressed = output.toUint8Array();
        console.log(
          "Compressed data length:",
          compressed.length,
          "(original:",
          testData.length,
          ")"
        );

        // Test compression ratio
        const ratio = (
          ((testData.length - compressed.length) / testData.length) *
          100
        ).toFixed(1);
        console.log("Compression ratio:", ratio + "%");

        // Decompress
        const input2 = new window.LZMA.iStream(compressed.buffer);
        const output2 = new window.LZMA.oStream();
        window.LZMA.decode(input2, output2);
        const decompressed = output2.toUint8Array();
        console.log("Decompressed data length:", decompressed.length);

        const success =
          decompressed.length === testData.length &&
          decompressed.every((byte, i) => byte === testData[i]);

        console.log("Round-trip successful:", success);

        if (success) {
          console.log("✅ LZMA compression test PASSED - mode 7 working!");
          if (compressed.length < testData.length) {
            console.log("🎉 Real LZMA compression achieved!");
          } else {
            console.log("📝 Data copied without compression (still valid)");
          }
        } else {
          console.log("❌ LZMA test FAILED");
        }
      } catch (e) {
        console.error("LZMA test error:", e);
      }
    })();
  } else {
    console.error("❌ LZMA not available for testing");
  }
}, 200);
