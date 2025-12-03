import { Component, signal, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { ProgramService } from '../../../../core/services/program.service';
import { PersistenceService } from '../../../../core/services/persistence.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { DecoderDialogComponent } from '../decoder-dialog/decoder-dialog';
import { AnalyzerDialogComponent } from '../analyzer-dialog/analyzer-dialog';

@Component({
  selector: 'app-controls',
  standalone: true,
  imports: [
    CommonModule,
    DecoderDialogComponent,
    AnalyzerDialogComponent,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
  ],
  templateUrl: './controls.html',
  styleUrls: ['./controls.css'],
})
export class ControlsComponent {
  @ViewChild(DecoderDialogComponent) decoderDialog!: DecoderDialogComponent;
  @ViewChild(AnalyzerDialogComponent) analyzerDialog!: AnalyzerDialogComponent;
  isToolsOpen = signal(false);
  isDarkMode = signal(true);

  constructor() {
    this.logger.lifecycle('Controls', 'Component initialized');
    this.updateTheme();
  }

  public readonly programService = inject(ProgramService);
  private readonly persistenceService = inject(PersistenceService);
  private readonly router = inject(Router);
  private readonly logger = inject(LoggerService);

  toggleTools() {
    const currentState = this.isToolsOpen();
    const newState = !currentState;
    this.isToolsOpen.set(newState);
    this.logger.action('Controls', 'Tools toggled', { currentState, newState });
  }

  closeTools() {
    const wasOpen = this.isToolsOpen();
    this.isToolsOpen.set(false);
    if (wasOpen) {
      this.logger.debug('Controls', 'Tools closed');
    }
  }

  openDecoder() {
    this.logger.action('Controls', 'Opening decoder dialog');
    this.decoderDialog?.open();
    this.closeTools();
  }

  openAnalyzer() {
    this.logger.action('Controls', 'Opening analyzer dialog');
    this.analyzerDialog?.open();
    this.closeTools();
  }

  /**
   * Navigate to previous page
   */
  prevPage() {
    this.logger.action('Controls', 'Navigating to previous page');
    this.programService.previousPage();
  }

  /**
   * Navigate to next page
   */
  nextPage() {
    this.logger.action('Controls', 'Navigating to next page');
    this.programService.nextPage();
  }

  /**
   * Import program from file
   */
  async importProgram() {
    this.logger.action('Controls', 'Opening file picker for import');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.mpp';
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        this.logger.info('Controls', 'File selected for import', { filename: file.name });
        try {
          const text = await file.text();
          this.logger.debug('Controls', 'File content loaded, importing...');
          await this.persistenceService.onImport(text);
          this.logger.info('Controls', 'Import completed successfully');
        } catch (error) {
          this.logger.error('Controls', 'Import error', error);
        }
      } else {
        this.logger.debug('Controls', 'No file selected');
      }
    };
    input.click();
  }

  /**
   * Export program to file
   */
  async exportProgram() {
    this.logger.action('Controls', 'Starting program export');
    try {
      const data = await this.persistenceService.onExport('base64');
      this.logger.debug('Controls', 'Export data received, creating download');
      const blob = new Blob([data], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const filename = `program-${new Date().toISOString().slice(0, 10)}.txt`;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      this.logger.info('Controls', 'Export completed successfully', { filename });
    } catch (error) {
      this.logger.error('Controls', 'Export error', error);
    }
  }

  /**
   * Validate program
   */
  validateProgram() {
    this.logger.action('Controls', 'Starting program validation');
    this.persistenceService.onValidate();
  }

  /**
   * Clear program with confirmation
   */
  async clearProgram() {
    this.logger.action('Controls', 'Starting program clear');
    await this.persistenceService.onClear();
  }

  /**
   * Copy program to clipboard
   */
  async copyToClipboard() {
    this.logger.action('Controls', 'Copying program to clipboard');
    try {
      const data = await this.persistenceService.onExport('base64');
      await navigator.clipboard.writeText(data);
      this.logger.info('Controls', 'Program copied to clipboard successfully');
    } catch (error) {
      this.logger.error('Controls', 'Copy to clipboard error', error);
    }
  }

  /**
   * Paste program from clipboard
   */
  async pasteFromClipboard() {
    this.logger.action('Controls', 'Pasting program from clipboard');
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        this.logger.debug('Controls', 'Clipboard content found, importing...');
        await this.persistenceService.onImport(text);
        this.logger.info('Controls', 'Program pasted from clipboard successfully');
      } else {
        this.logger.warn('Controls', 'Clipboard is empty');
      }
    } catch (error) {
      this.logger.error('Controls', 'Paste from clipboard error', error);
    }
  }

  /**
   * Navigate to settings page
   */
  openSettings() {
    this.logger.action('Controls', 'Navigating to settings page');
    this.router.navigate(['/settings']);
    this.closeTools();
  }

  toggleTheme() {
    this.isDarkMode.set(!this.isDarkMode());
    this.updateTheme();
  }

  private updateTheme() {
    if (this.isDarkMode()) {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
    }
  }
}
