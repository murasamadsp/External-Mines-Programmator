// Utility functions for Mines Programmator serialization

import { Instruction } from "../../types/instruction.js";
import { ProgAction } from "../../constants/actions.js";
import {
  MODERN_PAGE_WIDTH,
  ASCII_ENCODER,
  ASCII_DECODER,
} from "./serializer-constants.js";

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
  // Follow C# logic: lbl = labels[index].Split('@')
  // ret[index].label = lbl[0]; (can be empty string "")
  // if (lbl.Length == 2) ret[index].value = int.Parse(lbl[1]);
  // In C#, empty string stays as empty string, not converted to null
  if (!labelStr || labelStr === "") {
    return { label: null, value: null };
  }
  const parts = labelStr.split("@");
  if (parts.length > 2) {
    throw new Error("Malformed program");
  }
  // In C#, lbl[0] can be empty string "", which stays as ""
  // But in JavaScript, we use null to represent "no label"
  // So empty string becomes null for consistency
  const label = parts[0] === "" ? null : parts[0];
  const value = parts.length === 2 ? parseInt(parts[1], 10) : null;
  return { label, value };
}

export function asciiToUint8(str) {
  return ASCII_ENCODER.encode(str);
}

export function uint8ToAscii(bytes) {
  return ASCII_DECODER.decode(bytes);
}
