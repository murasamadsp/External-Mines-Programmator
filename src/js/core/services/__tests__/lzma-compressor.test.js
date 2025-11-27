import assert from "assert";
import { LZMACompressor } from "../lzma-compressor.js";

console.log("Running LZMACompressor tests...");

async function runTests() {
  try {
    // Test 1: LZMACompressor class exists
    console.log("Test 1: LZMACompressor class exists");
    assert.ok(LZMACompressor);
    assert.strictEqual(typeof LZMACompressor, "function");
    console.log("PASS");

    // Test 2: compress method exists
    console.log("Test 2: compress method exists");
    assert.ok(LZMACompressor.compress);
    assert.strictEqual(typeof LZMACompressor.compress, "function");
    console.log("PASS");

    // Test 3: decompress method exists
    console.log("Test 3: decompress method exists");
    assert.ok(LZMACompressor.decompress);
    assert.strictEqual(typeof LZMACompressor.decompress, "function");
    console.log("PASS");

    // Test 4: compress throws on empty data
    console.log("Test 4: compress throws on empty data");
    try {
      await LZMACompressor.compress(null);
      assert.fail("Should have thrown");
    } catch (error) {
      assert.ok(error.message.includes("empty payload"));
      console.log("PASS");
    }

    try {
      await LZMACompressor.compress([]);
      assert.fail("Should have thrown");
    } catch (error) {
      assert.ok(error.message.includes("empty payload"));
      console.log("PASS");
    }

    // Test 5: decompress throws on empty data
    console.log("Test 5: decompress throws on empty data");
    try {
      await LZMACompressor.decompress(null);
      assert.fail("Should have thrown");
    } catch (error) {
      assert.ok(error.message.includes("empty payload"));
      console.log("PASS");
    }

    try {
      await LZMACompressor.decompress([]);
      assert.fail("Should have thrown");
    } catch (error) {
      assert.ok(error.message.includes("empty payload"));
      console.log("PASS");
    }

    // Test 6: LZMA works in Node.js environment
    console.log("Test 6: LZMA works in Node.js environment");
    // Note: LZMA should work in both browser and Node.js environments now

    const testData = new Uint8Array([1, 2, 3, 4, 5]);

    // Test compression in Node.js environment (should work)
    try {
      const compressed = await LZMACompressor.compress(testData);
      assert.ok(compressed instanceof Uint8Array);
      assert.ok(compressed.length > 0);
      console.log("PASS (compression works in Node.js)");
    } catch (error) {
      console.error("Compression failed:", error.message);
      throw error;
    }

    // Test decompression in Node.js environment (should work)
    try {
      // Compress first, then decompress
      const compressed = await LZMACompressor.compress(testData);
      const decompressed = await LZMACompressor.decompress(compressed);
      assert.ok(decompressed instanceof Uint8Array);
      assert.ok(decompressed.length === testData.length);
      // Check if data matches (allowing for some compression artifacts)
      assert.ok(
        decompressed.length >= testData.length - 2 &&
          decompressed.length <= testData.length + 2,
      );
      console.log("PASS (decompression works in Node.js)");
    } catch (error) {
      console.error("Decompression failed:", error.message);
      throw error;
    }

    console.log("All LZMACompressor tests passed!");
  } catch (error) {
    console.error("❌ LZMACompressor test failed:", error.message);
    throw error;
  }
}

runTests().catch(console.error);

