import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  ViewChild,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgramService } from '../../core/services/program.service';
import { PersistenceService } from '../../core/services/persistence.service';
import { ToastService } from '../../core/services/toast.service';
import { ActionPaletteComponent } from './components/action-palette/action-palette';
import { ProgramGridComponent } from './components/program-grid/program-grid';
import { ControlsComponent } from './components/controls/controls';
import { SnippetsPanelComponent } from './components/snippets-panel/snippets-panel';
import { ValidationPanelComponent } from '../../shared/components/validation-panel/validation-panel.component';
import { ShortcutsDialogComponent } from '../../shared/components/shortcuts-dialog/shortcuts-dialog.component';
import { LoadingDirective } from '../../shared/directives/loading.directive';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [
    CommonModule,
    ActionPaletteComponent,
    ProgramGridComponent,
    ControlsComponent,
    SnippetsPanelComponent,
    ValidationPanelComponent,
    ShortcutsDialogComponent,
    LoadingDirective,
  ],
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css'],
})
export class EditorComponent implements OnInit, OnDestroy {
  private readonly programService = inject(ProgramService);
  public readonly persistenceService = inject(PersistenceService);
  private readonly toastService = inject(ToastService);

  @ViewChild(ValidationPanelComponent) validationPanel?: ValidationPanelComponent;
  @ViewChild(ShortcutsDialogComponent) shortcutsDialog?: ShortcutsDialogComponent;

  // Loading state
  readonly isLoading = signal(true);

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Show shortcuts dialog on '?' press
    if (event.key === '?' && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      this.showShortcuts();
    }

    // Validation panel on Ctrl+Shift+V
    if (event.key === 'V' && event.ctrlKey && event.shiftKey) {
      event.preventDefault();
      this.validationPanel?.toggle();
    }
  }

  showShortcuts(): void {
    this.shortcutsDialog?.toggle();
  }

  ngOnInit(): void {
    console.log('🏗️ Editor initialized');

    // Simulate loading delay for demo purposes
    setTimeout(() => {
      this.isLoading.set(false);
    }, 1000);

    // Start autosave
    this.persistenceService.startAutosave();
    console.log('⏰ Autosave started');

    // Try to restore autosaved program
    this.persistenceService.restoreAutosave();
    console.log('🔄 Checked for autosaved program');

    // Setup window resize handler for responsive layout
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
  }

  ngOnDestroy(): void {
    console.log('🧹 Editor cleanup');

    // Stop autosave
    this.persistenceService.stopAutosave();

    // Remove resize listener
    window.removeEventListener('resize', this.handleResize);
  }

  private handleResize = (): void => {
    // Handle responsive layout adjustments if needed
    // For now, this is a placeholder for future responsive features
  };
}
