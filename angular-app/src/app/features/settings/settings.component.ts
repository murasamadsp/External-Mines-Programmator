import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SettingsService } from '../../core/services/settings.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="settings-page">
      <header class="settings-header">
        <button class="btn-back" (click)="backToEditor()">◀ Назад</button>
        <h1 class="settings-title">Налаштування</h1>
      </header>

      <main class="settings-content">
        <div class="settings-section">
          <h2 class="section-title">Редактор</h2>
          <div class="setting-item">
            <label class="setting-label">
              <input
                type="checkbox"
                [checked]="editorSettings().autoSave"
                (change)="updateEditor('autoSave', $event)"
              />
              Автозбереження
            </label>
          </div>
          <div class="setting-item">
            <label class="setting-label">
              <input
                type="checkbox"
                [checked]="editorSettings().confirmBeforeLoad"
                (change)="updateEditor('confirmBeforeLoad', $event)"
              />
              Підтвердження перед завантаженням
            </label>
          </div>
          <div class="setting-item">
            <label class="setting-label">
              <input
                type="checkbox"
                [checked]="editorSettings().confirmBeforeClear"
                (change)="updateEditor('confirmBeforeClear', $event)"
              />
              Підтвердження перед очищенням
            </label>
          </div>
        </div>

        <div class="settings-section">
          <h2 class="section-title">Валідація</h2>
          <div class="setting-item">
            <label class="setting-label">
              <input
                type="checkbox"
                [checked]="validationSettings().validateOnExport"
                (change)="updateValidation('validateOnExport', $event)"
              />
              Валідувати при експорті
            </label>
          </div>
          <div class="setting-item">
            <label class="setting-label">
              <input
                type="checkbox"
                [checked]="validationSettings().showValidationErrors"
                (change)="updateValidation('showValidationErrors', $event)"
              />
              Показувати помилки валідації
            </label>
          </div>
        </div>

        <div class="settings-section">
          <h2 class="section-title">Експорт</h2>
          <div class="setting-item">
            <label class="setting-label">
              <input
                type="checkbox"
                [checked]="exportSettings().preserveEmptyCells"
                (change)="updateExport('preserveEmptyCells', $event)"
              />
              Зберігати порожні комірки
            </label>
          </div>
        </div>

        <div class="settings-section">
          <h2 class="section-title">Налагодження</h2>
          <div class="setting-item">
            <label class="setting-label">
              <input
                type="checkbox"
                [checked]="debugSettings().logToConsole"
                (change)="updateDebug('logToConsole', $event)"
              />
              Логувати в консоль
            </label>
          </div>
        </div>
      </main>

      <footer class="settings-footer">
        <button class="btn-secondary" (click)="resetAll()">Скинути все</button>
        <button class="btn-primary" (click)="saveSettings()">Зберегти</button>
      </footer>
    </div>
  `,
  styles: [
    `
      .settings-page {
        min-height: 100vh;
        background: var(--color-background, #0f172a);
        color: var(--color-text-primary, #f1f5f9);
        display: flex;
        flex-direction: column;
      }

      .settings-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        border-bottom: 1px solid var(--border-color, #334155);
        background: var(--surface-bg-elevated, #1e293b);
      }

      .btn-back {
        background: var(--surface-bg, #334155);
        border: 1px solid var(--border-color, #475569);
        color: var(--color-text-primary, #f1f5f9);
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
        cursor: pointer;
        font-size: 0.875rem;
        transition: all 0.2s;
      }

      .btn-back:hover {
        background: var(--surface-bg-strong, #475569);
      }

      .settings-title {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
      }

      .settings-content {
        flex: 1;
        padding: 2rem;
        max-width: 800px;
        margin: 0 auto;
        width: 100%;
      }

      .settings-section {
        margin-bottom: 2rem;
        padding: 1.5rem;
        background: var(--surface-bg-elevated, #1e293b);
        border-radius: 0.5rem;
        border: 1px solid var(--border-color, #334155);
      }

      .section-title {
        margin: 0 0 1rem 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--color-text-primary, #f1f5f9);
      }

      .setting-item {
        margin-bottom: 1rem;
      }

      .setting-label {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        cursor: pointer;
        font-size: 0.875rem;
        color: var(--color-text-primary, #f1f5f9);
      }

      .setting-label input[type='checkbox'] {
        width: 1rem;
        height: 1rem;
        accent-color: var(--color-primary, #3b82f6);
      }

      .settings-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        border-top: 1px solid var(--border-color, #334155);
        background: var(--surface-bg-elevated, #1e293b);
      }

      .btn-primary,
      .btn-secondary {
        padding: 0.75rem 1.5rem;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }

      .btn-primary {
        background: var(--color-primary, #3b82f6);
        color: white;
        border: none;
      }

      .btn-primary:hover {
        background: var(--color-primary-dark, #2563eb);
      }

      .btn-secondary {
        background: transparent;
        color: var(--color-text-primary, #f1f5f9);
        border: 1px solid var(--border-color, #475569);
      }

      .btn-secondary:hover {
        background: var(--surface-bg-strong, #475569);
      }
    `,
  ],
})
export class SettingsComponent {
  private readonly settingsService = inject(SettingsService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  // Settings signals
  editorSettings = signal(this.settingsService.editor());
  validationSettings = signal(this.settingsService.validation());
  exportSettings = signal(this.settingsService.export());
  debugSettings = signal(this.settingsService.debug());

  hasChanges = computed(() => {
    return (
      JSON.stringify(this.editorSettings()) !== JSON.stringify(this.settingsService.editor()) ||
      JSON.stringify(this.validationSettings()) !==
        JSON.stringify(this.settingsService.validation()) ||
      JSON.stringify(this.exportSettings()) !== JSON.stringify(this.settingsService.export()) ||
      JSON.stringify(this.debugSettings()) !== JSON.stringify(this.settingsService.debug())
    );
  });

  updateEditor(key: string, event: Event) {
    const target = event.target as HTMLInputElement;
    this.editorSettings.update((settings) => ({
      ...settings,
      [key]: target.checked,
    }));
  }

  updateValidation(key: string, event: Event) {
    const target = event.target as HTMLInputElement;
    this.validationSettings.update((settings) => ({
      ...settings,
      [key]: target.checked,
    }));
  }

  updateExport(key: string, event: Event) {
    const target = event.target as HTMLInputElement;
    this.exportSettings.update((settings) => ({
      ...settings,
      [key]: target.checked,
    }));
  }

  updateDebug(key: string, event: Event) {
    const target = event.target as HTMLInputElement;
    this.debugSettings.update((settings) => ({
      ...settings,
      [key]: target.checked,
    }));
  }

  saveSettings() {
    this.settingsService.updateEditor(this.editorSettings());
    this.settingsService.updateValidation(this.validationSettings());
    this.settingsService.updateExport(this.exportSettings());
    this.settingsService.updateDebug(this.debugSettings());

    this.toastService.success('Налаштування збережено!');
  }

  resetAll() {
    if (confirm('Скинути всі налаштування до значень за замовчуванням?')) {
      // Reset to defaults
      this.editorSettings.set({
        autoSave: true,
        autoSaveInterval: 30000,
        confirmBeforeLoad: true,
        confirmBeforeClear: true,
      });
      this.validationSettings.set({
        validateOnExport: true,
        showValidationErrors: true,
      });
      this.exportSettings.set({
        preserveEmptyCells: false,
      });
      this.debugSettings.set({
        logToConsole: true,
      });

      this.saveSettings();
      this.toastService.info('Налаштування скинуто до значень за замовчуванням');
    }
  }

  backToEditor() {
    this.router.navigate(['/editor']);
  }
}
