import { Injectable, signal, OnDestroy, inject } from '@angular/core';
import { ProgramService } from './program.service';
import { DialogService } from './dialog.service';
import { SerializerService } from './serializer.service';
import { ProgramStorageUtil, SettingsStorageUtil } from '../utils/storage.util';
import { ProgAction, Instruction } from '../models/program.model';
import { countNonEmpty } from '../utils/instruction.util';

@Injectable({
  providedIn: 'root',
})
export class PersistenceService implements OnDestroy {
  private autosaveTimer: ReturnType<typeof setInterval> | null = null;
  private readonly autosaveInterval = 30000; // 30 seconds
  private lastSaveHash: string | null = null;
  private isDestroyed = false;

  // Feedback message signal for UI
  feedbackMessage = signal<{
    text: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  private readonly programService = inject(ProgramService);
  private readonly dialogService = inject(DialogService);
  private readonly serializerService = inject(SerializerService);

  /**
   * Import program from text
   */
  async onImport(importText: string): Promise<void> {
    const startTime = performance.now();
    try {
      console.log(`📥 Starting import (text size: ${importText.length} characters)...`);

      // Deserialize the program using decode method
      const instructions = await this.serializerService.decode(importText);

      // Update program with new instructions
      this.programService.loadInstructions(instructions);

      const importTime = performance.now() - startTime;
      const nonEmptyCount = countNonEmpty(instructions);

      this.showFeedback('✅ Program imported successfully', 'success');
      console.log(
        `📥 Imported program: ${instructions.length} instructions (${nonEmptyCount} non-empty) in ${importTime.toFixed(2)}ms`,
      );
    } catch (error: unknown) {
      const errorTime = performance.now() - startTime;
      console.error(`❌ Import error after ${errorTime.toFixed(2)}ms:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.showFeedback(`❌ Import error: ${errorMessage}`, 'error');
      throw error;
    }
  }

  /**
   * Export program in different formats
   */
  async onExport(format: 'codes' | 'text' | 'base64'): Promise<string> {
    const startTime = performance.now();
    try {
      console.log(`📤 Starting export in format ${format}...`);

      const instructions = this.programService.getAllInstructions();
      const nonEmptyCount = countNonEmpty(instructions);

      let result: string;

      switch (format) {
        case 'codes': {
          const nonEmptyInstructions = instructions.filter(
            (inst) => inst.action !== ProgAction.None,
          );
          result = nonEmptyInstructions.map((inst) => inst.action).join(' ');
          console.log(
            `📋 Export codes: ${nonEmptyCount} instructions → ${result.length} characters`,
          );
          break;
        }

        case 'text':
        case 'base64':
          result = await this.serializerService.encode(instructions);
          console.log(
            `📦 Export Base64: ${instructions.length} instructions → ${result.length} characters`,
          );
          break;

        default:
          throw new Error(`Unknown export format: ${format}`);
      }

      const exportTime = performance.now() - startTime;
      console.log(
        `📤 Exported in format ${format}: ${result.length} characters in ${exportTime.toFixed(2)}ms`,
      );
      return result;
    } catch (error: unknown) {
      const errorTime = performance.now() - startTime;
      console.error(`❌ Export error in format ${format} after ${errorTime.toFixed(2)}ms:`, error);
      throw error;
    }
  }

  /**
   * Validate program
   */
  onValidate(): void {
    const startTime = performance.now();
    const instructions = this.programService.getAllInstructions();
    const nonEmptyCount = countNonEmpty(instructions);

    console.log(
      `🔍 Starting validation: ${instructions.length} instructions (${nonEmptyCount} non-empty)`,
    );

    const validation = this.programService.validateProgram();
    const validationTime = performance.now() - startTime;

    console.log(
      `🔍 Validation results: ${validation.errors.length} errors, ${validation.warnings.length} warnings (in ${validationTime.toFixed(2)}ms)`,
    );

    if (validation.errors.length > 0) {
      console.error(`❌ Found ${validation.errors.length} validation errors:`, validation.errors);
      const errorMessages = validation.errors.map((e) => `• ${e.message}`).join('\n');
      this.showFeedback(`❌ Found errors: ${validation.errors.length}\n${errorMessages}`, 'error');
    }

    if (validation.warnings.length > 0) {
      console.warn(
        `⚠️ Found ${validation.warnings.length} validation warnings:`,
        validation.warnings,
      );
      // Show fewer details in feedback since we have a dedicated validation panel
      this.showFeedback(`⚠️ Found ${validation.warnings.length} validation warnings`, 'info');
    }

    if (validation.errors.length === 0 && validation.warnings.length === 0) {
      console.log('✅ Program passed validation without errors or warnings');
      this.showFeedback('✅ Program is valid!', 'success');
    }
  }

  /**
   * Clear program
   */
  async onClear(): Promise<void> {
    const startTime = performance.now();
    const instructions = this.programService.getAllInstructions();
    const nonEmptyCount = countNonEmpty(instructions);

    console.log(
      `🗑️ Request to clear program (${instructions.length} instructions, ${nonEmptyCount} non-empty)`,
    );

    const confirmed = await this.dialogService.showConfirmDialog(
      'Do you really want to clear the entire program?',
      'Clear Program',
    );

    if (confirmed) {
      this.programService.clearProgram();

      // Clear autosave after clearing program
      ProgramStorageUtil.clearAutosave();
      this.lastSaveHash = null;

      const clearTime = performance.now() - startTime;
      console.log(
        `🗑️ Program cleared: removed ${nonEmptyCount} instructions in ${clearTime.toFixed(2)}ms`,
      );
    } else {
      console.log('❌ Program clear cancelled by user');
    }
  }

  /**
   * Start automatic save
   */
  startAutosave(): void {
    // Check if autosave is enabled in settings
    const autoSaveEnabled = SettingsStorageUtil.get<boolean>('autoSave', true);

    if (!autoSaveEnabled) {
      console.log('⏸️ Autosave disabled in user settings');
      return;
    }

    if (this.autosaveTimer) {
      clearInterval(this.autosaveTimer);
      console.log('🔄 Restarting autosave timer');
    }

    this.autosaveTimer = setInterval(() => {
      if (!this.isDestroyed) {
        this.performAutosave();
      }
    }, this.autosaveInterval);

    console.log(`⏰ Autosave started (interval: ${this.autosaveInterval / 1000} sec)`);
  }

  /**
   * Stop automatic save
   */
  stopAutosave(): void {
    if (this.autosaveTimer) {
      clearInterval(this.autosaveTimer);
      this.autosaveTimer = null;
      console.log('⏸️ Autosave stopped');
    }
  }

  /**
   * Perform automatic save
   */
  private performAutosave(): void {
    if (this.isDestroyed) return;

    const startTime = performance.now();
    try {
      const instructions = this.programService.getAllInstructions();

      // Don't save if no instructions
      if (instructions.length === 0) {
        console.log('🔄 Autosave: no instructions to save');
        return;
      }

      const currentHash = this.calculateProgramHash(instructions);

      // Check if program has changed
      if (currentHash === this.lastSaveHash) {
        console.log('🔄 Autosave: no changes since last save');
        return;
      }

      console.log(`💾 Performing autosave (${instructions.length} instructions)...`);
      const success = ProgramStorageUtil.autosave(instructions);

      if (success) {
        this.lastSaveHash = currentHash;
        const saveTime = performance.now() - startTime;
        console.log(
          `💾 Autosave successful: ${instructions.length} instructions in ${saveTime.toFixed(2)}ms`,
        );
      } else {
        console.warn('⚠️ Autosave error - data not saved');
      }
    } catch (error) {
      const errorTime = performance.now() - startTime;
      console.error(`❌ Critical autosave error after ${errorTime.toFixed(2)}ms:`, error);
    }
  }

  /**
   * Calculate program hash for change detection
   */
  private calculateProgramHash(instructions: Instruction[]): string {
    const data = JSON.stringify(instructions);
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  /**
   * Restore autosaved program
   */
  async restoreAutosave(): Promise<void> {
    if (this.isDestroyed) return;

    try {
      const autosaveData = ProgramStorageUtil.loadAutosave();

      // loadAutosave returns null for empty programs, so we only check for existence
      if (autosaveData) {
        const nonEmptyCount = countNonEmpty(autosaveData.instructions);

        // Ask user about restoration
        const shouldRestore = await this.dialogService.showConfirmDialog(
          `Found autosaved program. Restore it?\n\n` +
            `Saved: ${new Date(autosaveData.timestamp).toLocaleString()}\n` +
            `Instructions: ${nonEmptyCount}`,
          'Restore Program',
        );

        if (shouldRestore) {
          // Restore program
          this.programService.loadInstructions(autosaveData.instructions);

          console.log(
            `🔄 Autosaved program restored (${autosaveData.instructions.length} instructions)`,
          );

          // Clear autosave after successful restoration
          ProgramStorageUtil.clearAutosave();
        }
      }
    } catch (error) {
      console.error('❌ Autosave restoration error:', error);
    }
  }

  /**
   * Apply expert settings
   */
  applyExpertSettings(settings: Record<string, unknown>): void {
    console.log(`🔧 Applying expert settings: ${Object.keys(settings).length} parameters`);

    // Check autosave setting
    if (Object.prototype.hasOwnProperty.call(settings, 'autoSave')) {
      const autoSaveEnabled = settings['autoSave'];
      console.log(`⏰ Autosave: ${autoSaveEnabled ? 'enabled' : 'disabled'}`);

      if (autoSaveEnabled) {
        this.startAutosave();
      } else {
        this.stopAutosave();
      }
    }

    console.log('✅ Expert settings applied successfully:', settings);
  }

  /**
   * Show feedback message to user
   */
  private showFeedback(text: string, type: 'success' | 'error' | 'info'): void {
    this.feedbackMessage.set({ text, type });

    // Auto-clear feedback after 5 seconds
    setTimeout(() => {
      if (this.feedbackMessage()?.text === text) {
        this.feedbackMessage.set(null);
      }
    }, 5000);
  }

  ngOnDestroy(): void {
    console.log('🧹 Cleaning up PersistenceService...');
    this.isDestroyed = true;
    this.stopAutosave();
    console.log('✅ PersistenceService cleaned up');
  }
}
