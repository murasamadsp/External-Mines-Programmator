import { ProgAction } from '../models/program.model';
import { ACTION_METADATA } from '../data/action-metadata';

export function getActionCode(actionName: string): number | undefined {
  return (ProgAction as unknown as Record<string, number>)[actionName];
}

export function getActionByCode(code: number): { name: string; code: number } | null {
  const name = ProgAction[code];
  return name ? { name, code } : null;
}

export function getActionMetadata(actionName: string): { label: string; tooltip: string } | null {
  return ACTION_METADATA[actionName] || null;
}

export function getActionName(code: number): string | null {
  return ProgAction[code] || null;
}
