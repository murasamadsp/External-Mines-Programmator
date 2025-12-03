import { Instruction, ProgAction } from '../models/program.model';

/**
 * Utility functions for working with program instructions
 */

/**
 * Check if an instruction is empty (None action)
 */
export function isEmptyInstruction(instruction: Instruction): boolean {
  return instruction.action === ProgAction.None;
}

/**
 * Check if an instruction is non-empty
 */
export function isNonEmptyInstruction(instruction: Instruction): boolean {
  return !isEmptyInstruction(instruction);
}

/**
 * Count non-empty instructions in an array
 */
export function countNonEmpty(instructions: Instruction[]): number {
  return instructions.filter(isNonEmptyInstruction).length;
}

/**
 * Remove trailing empty instructions from array
 * Keeps intermediate empty instructions (preserves structure)
 */
export function compactInstructions(instructions: Instruction[]): Instruction[] {
  // Find last non-empty instruction
  let lastNonEmptyIndex = -1;
  for (let i = instructions.length - 1; i >= 0; i--) {
    if (isNonEmptyInstruction(instructions[i])) {
      lastNonEmptyIndex = i;
      break;
    }
  }

  // If all empty or no instructions, return empty array
  if (lastNonEmptyIndex === -1) {
    return [];
  }

  // Return array up to last non-empty instruction (inclusive)
  return instructions.slice(0, lastNonEmptyIndex + 1);
}

/**
 * Expand instructions array to target length with empty instructions
 */
export function expandInstructions(
  instructions: Instruction[],
  targetLength: number,
): Instruction[] {
  if (instructions.length >= targetLength) {
    return instructions.slice(0, targetLength);
  }

  const expanded = [...instructions];
  const emptyInstruction: Instruction = {
    action: ProgAction.None,
    label: null,
    value: null,
  };

  while (expanded.length < targetLength) {
    expanded.push({ ...emptyInstruction });
  }

  return expanded;
}

/**
 * Check if program is effectively empty (no non-empty instructions)
 */
export function isProgramEmpty(instructions: Instruction[]): boolean {
  return countNonEmpty(instructions) === 0;
}

/**
 * Get program statistics
 */
export function getProgramStats(instructions: Instruction[]): {
  total: number;
  nonEmpty: number;
  empty: number;
  compactSize: number;
} {
  const nonEmpty = countNonEmpty(instructions);
  const compacted = compactInstructions(instructions);

  return {
    total: instructions.length,
    nonEmpty,
    empty: instructions.length - nonEmpty,
    compactSize: compacted.length,
  };
}
