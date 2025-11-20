// Utility functions for Mines Programmator serialization

import { Instruction, ProgAction } from "../../index.js";
import {
  MODERN_PAGE_WIDTH,
  ASCII_ENCODER,
  ASCII_DECODER,
  V1_MAPPINGS,
  V3_MAPPINGS
} from "./serializer-constants.js";

export function findMapping(source, mappings) {
  for (const [key, action] of mappings) {
    if (source.startsWith(key)) {
      return [key, action];
    }
  }
  return null;
}

export function pushInstruction(ret, action, label = null, value = null) {
  ret.push(new Instruction(action, label ?? null, value ?? null));
}

export function padRowToModernWidth(ret, startColumn) {
  for (let i = startColumn; i < MODERN_PAGE_WIDTH; i++) {
    pushInstruction(ret, ProgAction.None);
  }
}

export function appendNoneUntil(ret, targetLength) {
  while (ret.length < targetLength) {
    pushInstruction(ret, ProgAction.None);
  }
}

export function parseLabelParts(labelStr) {
  if (!labelStr) {
    return { label: "0", value: null };
  }
  const parts = labelStr.split("@");
  if (parts.length > 2) {
    throw new Error("Malformed program");
  }
  return {
    label: parts[0] || "0",
    value: parts.length === 2 ? parseInt(parts[1], 10) : null,
  };
}

export function asciiToUint8(str) {
  return ASCII_ENCODER.encode(str);
}

export function uint8ToAscii(bytes) {
  return ASCII_DECODER.decode(bytes);
}
