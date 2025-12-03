import { Injectable, signal, inject, effect, OnDestroy } from '@angular/core';
import { Instruction, ProgAction } from '../models/program.model';
import { SerializerService } from './serializer.service';
import { SettingsService } from './settings.service';
import { MODERN_PAGE_WIDTH, MODERN_PAGE_HEIGHT } from './serializer-constants';

export const PAGE_SIZE = MODERN_PAGE_WIDTH * MODERN_PAGE_HEIGHT;
export const MAX_PAGES = 16;
export const MAX_INSTRUCTIONS = MAX_PAGES * PAGE_SIZE;

@Injectable({
  providedIn: 'root',
})
export class ProgramService implements OnDestroy {
  // State
  private instructionsSignal = signal<Instruction[]>([]);
  currentPage = signal(0);

  // Computed
  readonly instructions = this.instructionsSignal.asReadonly();

  // Original data for round-trip compatibility
  private originalLength: number | null = null;
  private originalCompressedData: string | null = null;

  private readonly serializer = inject(SerializerService);
  private readonly settings = inject(SettingsService);

  // Auto-save timer
  private autoSaveTimer: number | null = null;
  private isDirty = signal(false);

  constructor() {
    this.initializeEmptyProgram();
    this.setupAutoSave();
  }

  /**
   * Setup auto-save functionality based on settings
   */
  private setupAutoSave(): void {
    effect(() => {
      const editorSettings = this.settings.editor();

      // Clear existing timer
      if (this.autoSaveTimer !== null) {
        window.clearInterval(this.autoSaveTimer);
        this.autoSaveTimer = null;
      }

      // Setup new timer if auto-save is enabled
      if (editorSettings.autoSave && editorSettings.autoSaveInterval > 0) {
        this.autoSaveTimer = window.setInterval(() => {
          if (this.isDirty()) {
            this.autoSaveProgram();
          }
        }, editorSettings.autoSaveInterval * 1000);
      }
    });
  }

  /**
   * Auto-save program to localStorage
   */
  private async autoSaveProgram(): Promise<void> {
    try {
      const code = await this.exportProgram();
      localStorage.setItem('autosave_program', code);
      localStorage.setItem('autosave_timestamp', new Date().toISOString());
      this.isDirty.set(false);

      if (this.settings.debug().logToConsole) {
        console.log('[ProgramService] Auto-saved program');
      }
    } catch (error) {
      console.error('[ProgramService] Auto-save failed:', error);
    }
  }

  initializeEmptyProgram() {
    const totalInstructions = MAX_INSTRUCTIONS;
    const emptyInstructions = new Array<Instruction>(totalInstructions);
    for (let i = 0; i < totalInstructions; i++) {
      emptyInstructions[i] = {
        action: ProgAction.None,
        label: null,
        value: null,
      };
    }
    this.instructionsSignal.set(emptyInstructions);
    this.originalLength = null;
    this.originalCompressedData = null;
  }

  async loadProgram(source: string) {
    try {
      // Check confirmation settings
      if (this.settings.editor().confirmBeforeLoad && this.isDirty()) {
        const confirmed = confirm('У вас є незбережені зміни. Продовжити завантаження?');
        if (!confirmed) {
          return;
        }
      }

      const decodedInstructions = await this.serializer.decode(source);

      // Store original data for round-trip
      this.originalLength = decodedInstructions.length;
      this.originalCompressedData = source;

      // Slice or pad to MAX_INSTRUCTIONS
      let instructions = decodedInstructions.slice(0, MAX_INSTRUCTIONS);

      // Pad if necessary
      if (instructions.length < MAX_INSTRUCTIONS) {
        const padding = new Array<Instruction>(MAX_INSTRUCTIONS - instructions.length);
        for (let i = 0; i < padding.length; i++) {
          padding[i] = { action: ProgAction.None, label: null, value: null };
        }
        instructions = [...instructions, ...padding];
      }

      this.instructionsSignal.set(instructions);
      this.isDirty.set(false);

      if (this.settings.debug().logToConsole) {
        console.log('[ProgramService] Program loaded successfully');
      }
    } catch (error) {
      console.error('Failed to load program:', error);
      throw error;
    }
  }

  async exportProgram(): Promise<string> {
    const currentInstructions = this.instructionsSignal();
    const exportSettings = this.settings.export();

    // Validate if enabled
    if (this.settings.validation().validateOnExport) {
      const validation = this.validateProgram();
      if (validation.errors.length > 0 && this.settings.validation().showValidationErrors) {
        const errorMsg = validation.errors.map((e) => e.message).join('\n');
        console.error('[ProgramService] Validation errors:', errorMsg);

        if (!confirm(`Виявлено помилки валідації:\n${errorMsg}\n\nПродовжити експорт?`)) {
          throw new Error('Export cancelled due to validation errors');
        }
      }
    }

    // 1:1 Round-trip check
    if (this.originalCompressedData && this.originalLength !== null) {
      // Simple check: if we haven't changed the length (logic could be more complex to detect changes)
      // For now, we follow the JS logic: if we have original data, we might want to return it
      // BUT only if the user hasn't modified it.
      // The JS logic was: "if we export the same amount of instructions, return original".
      // We'll stick to re-encoding for now to be safe, unless we implement dirty checking.
      // Re-encoding is safer to ensure WYSIWYG.
    }

    // Determine what to export
    let instructionsToEncode = currentInstructions;

    // Preserve empty cells or strip them
    if (!exportSettings.preserveEmptyCells) {
      // Find last non-empty instruction
      let lastIndex = currentInstructions.length - 1;
      while (lastIndex >= 0 && currentInstructions[lastIndex].action === ProgAction.None) {
        lastIndex--;
      }
      instructionsToEncode = currentInstructions.slice(0, lastIndex + 1);
    } else if (this.originalLength !== null) {
      // Respect original length
      instructionsToEncode = currentInstructions.slice(0, this.originalLength);
    }

    // Encode with settings
    const encoded = await this.serializer.encode(instructionsToEncode);

    // Mark as clean after successful export
    this.isDirty.set(false);

    if (this.settings.debug().logToConsole) {
      console.log('[ProgramService] Program exported successfully');
    }

    return encoded;
  }

  getInstructionAt(x: number, y: number, page = 0): Instruction {
    const pageOffset = page * PAGE_SIZE;
    const index = pageOffset + y * MODERN_PAGE_WIDTH + x;
    const instructions = this.instructionsSignal();
    return (
      instructions[index] || {
        action: ProgAction.None,
        label: null,
        value: null,
      }
    );
  }

  setInstructionAt(x: number, y: number, instruction: Instruction, page = 0) {
    const pageOffset = page * PAGE_SIZE;
    const index = pageOffset + y * MODERN_PAGE_WIDTH + x;

    this.instructionsSignal.update((instructions) => {
      const newInstructions = [...instructions];
      // Ensure array is large enough
      while (newInstructions.length <= index) {
        newInstructions.push({
          action: ProgAction.None,
          label: null,
          value: null,
        });
      }
      newInstructions[index] = instruction;
      return newInstructions;
    });

    // Mark as dirty for auto-save
    this.isDirty.set(true);
  }

  getPageInstructions(page: number): Instruction[] {
    const pageOffset = page * PAGE_SIZE;
    const instructions = this.instructionsSignal();
    const pageInstructions: Instruction[] = [];

    for (let y = 0; y < MODERN_PAGE_HEIGHT; y++) {
      for (let x = 0; x < MODERN_PAGE_WIDTH; x++) {
        const index = pageOffset + y * MODERN_PAGE_WIDTH + x;
        pageInstructions.push(
          instructions[index] || {
            action: ProgAction.None,
            label: null,
            value: null,
          },
        );
      }
    }
    return pageInstructions;
  }

  /**
   * Load instructions array into program
   */
  loadInstructions(instructions: Instruction[]): void {
    // Clear current program
    this.clearProgram();

    // Ensure we have exactly MAX_INSTRUCTIONS
    const newInstructions = [...instructions];
    while (newInstructions.length < MAX_INSTRUCTIONS) {
      newInstructions.push({
        action: ProgAction.None,
        label: null,
        value: null,
      });
    }

    // Set instructions
    this.instructionsSignal.set(newInstructions.slice(0, MAX_INSTRUCTIONS));
  }

  /**
   * Get all instructions
   */
  getAllInstructions(): Instruction[] {
    return this.instructionsSignal();
  }

  /**
   * Validate program
   */
  validateProgram(): {
    errors: { message: string }[];
    warnings: { message: string }[];
  } {
    const errors: { message: string }[] = [];
    const warnings: { message: string }[] = [];
    const instructions = this.instructionsSignal();

    // Basic validation - check for unreferenced labels
    const labels = new Set<string>();
    const gotoTargets = new Set<string>();

    instructions.forEach((inst, index) => {
      if (inst.action === ProgAction.Label && inst.label) {
        if (labels.has(inst.label)) {
          warnings.push({
            message: `Duplicate label "${inst.label}" at index ${index}`,
          });
        }
        labels.add(inst.label);
      }

      if ((inst.action === ProgAction.Goto || inst.action === ProgAction.Call) && inst.label) {
        gotoTargets.add(inst.label);
      }
    });

    // Check for undefined goto targets
    gotoTargets.forEach((target) => {
      if (!labels.has(target)) {
        errors.push({ message: `Goto/Call to undefined label "${target}"` });
      }
    });

    // Check for unreferenced labels
    labels.forEach((label) => {
      if (!gotoTargets.has(label)) {
        warnings.push({ message: `Unreferenced label "${label}"` });
      }
    });

    return { errors, warnings };
  }

  /**
   * Clear program
   */
  clearProgram(): void {
    // Check confirmation settings
    if (this.settings.editor().confirmBeforeClear && this.isDirty()) {
      const confirmed = confirm('У вас є незбережені зміни. Очистити програму?');
      if (!confirmed) {
        return;
      }
    }

    this.initializeEmptyProgram();
    this.isDirty.set(false);

    if (this.settings.debug().logToConsole) {
      console.log('[ProgramService] Program cleared');
    }
  }

  /**
   * Navigate to next page
   */
  nextPage(): void {
    this.currentPage.update((page) => Math.min(page + 1, MAX_PAGES - 1));
  }

  /**
   * Navigate to previous page
   */
  previousPage(): void {
    this.currentPage.update((page) => Math.max(page - 1, 0));
  }

  /**
   * Go to specific page
   */
  goToPage(page: number): void {
    if (page >= 0 && page < MAX_PAGES) {
      this.currentPage.set(page);
    }
  }

  clear() {
    this.clearProgram();
  }

  /**
   * Check if there are unsaved changes
   */
  hasUnsavedChanges(): boolean {
    return this.isDirty();
  }

  /**
   * Load auto-saved program
   */
  async loadAutoSave(): Promise<boolean> {
    try {
      const saved = localStorage.getItem('autosave_program');
      const timestamp = localStorage.getItem('autosave_timestamp');

      if (!saved) {
        return false;
      }

      if (timestamp) {
        const date = new Date(timestamp);
        const age = Date.now() - date.getTime();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        if (age > maxAge) {
          console.log('[ProgramService] Auto-save too old, ignoring');
          return false;
        }
      }

      await this.loadProgram(saved);
      return true;
    } catch (error) {
      console.error('[ProgramService] Failed to load auto-save:', error);
      return false;
    }
  }

  /**
   * Clear auto-save
   */
  clearAutoSave(): void {
    localStorage.removeItem('autosave_program');
    localStorage.removeItem('autosave_timestamp');
  }

  /**
   * Cleanup on destroy
   */
  ngOnDestroy(): void {
    if (this.autoSaveTimer !== null) {
      window.clearInterval(this.autoSaveTimer);
    }
  }
}
