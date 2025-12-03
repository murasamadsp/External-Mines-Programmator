import { Instruction, ProgAction } from "../models/program.model";
import { MODERN_PAGE_WIDTH } from "./serializer-constants";

export function pushInstruction(
  ret: Instruction[],
  action: ProgAction,
  label: string | null = null,
  value: string | null = null,
) {
  ret.push({ action, label, value });
}

export function padRowToModernWidth(ret: Instruction[], startColumn: number) {
  for (let i = startColumn; i < MODERN_PAGE_WIDTH; i++) {
    pushInstruction(ret, ProgAction.None);
  }
}

export function appendNoneUntil(ret: Instruction[], targetLength: number) {
  while (ret.length < targetLength) {
    pushInstruction(ret, ProgAction.None);
  }
}

export function parseLabelParts(labelStr: string): {
  label: string | null;
  value: string | null;
} {
  if (!labelStr || labelStr === "") {
    return { label: null, value: null };
  }
  const parts = labelStr.split("@");
  if (parts.length > 2) {
    throw new Error("Malformed program");
  }
  const label = parts[0] === "" ? null : parts[0];
  const value = parts.length === 2 ? parts[1] : null; // Keep value as string for now to match model
  return { label, value };
}

export function asciiToUint8(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

export function uint8ToAscii(bytes: Uint8Array): string {
  return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}
