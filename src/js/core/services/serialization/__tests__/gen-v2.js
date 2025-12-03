import { ProgramSerializer } from "../serializer.js";
import { Instruction } from "../../../types/instruction.js";
import { ProgAction } from "../../../constants/actions.js";
import { LZMACompressor } from "../../lzma-compressor.js";

// Mock LZMA for Node environment if needed, or rely on polyfill
// The project uses lzma-purejs.
// I need to ensure LZMACompressor works in Node.
// lzma-compressor.js imports ./lzma-js-polyfill.js
// Let's check lzma-js-polyfill.js

async function generate() {
  const program = [
    new Instruction(ProgAction.MoveUp),
    new Instruction(ProgAction.MoveDown),
  ];

  try {
    const encoded = await ProgramSerializer.encodeV2(program);
    console.log("V2 String:");
    console.log(encoded);
  } catch (e) {
    console.error(e);
  }
}

generate();
