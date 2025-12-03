import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgramService } from '../../../core/services/program.service';

export interface ValidationIssue {
  type: 'error' | 'warning';
  message: string;
  location?: { x: number; y: number; page: number };
  action?: string;
}

@Component({
  selector: 'app-validation-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="validation-panel" [class.open]="isOpen()">
      <!-- Toggle Button -->
      <button
        class="validation-toggle"
        [class.has-issues]="hasIssues()"
        (click)="toggle()"
        [attr.aria-label]="isOpen() ? 'Close validation panel' : 'Open validation panel'"
      >
        <span class="validation-icon">
          @if (errorCount() > 0) {
            ❌
          } @else if (warningCount() > 0) {
            ⚠️
          } @else {
            ✅
          }
        </span>
        <span class="validation-count">
          @if (errorCount() > 0) {
            {{ errorCount() }} errors
          } @else if (warningCount() > 0) {
            {{ warningCount() }} warnings
          } @else {
            No issues
          }
        </span>
      </button>

      <!-- Panel Content -->
      @if (isOpen()) {
        <div class="validation-content">
          <div class="validation-header">
            <h3 class="validation-title">Validation Results</h3>
            <button class="validation-close" (click)="close()" aria-label="Close panel">×</button>
          </div>

          <div class="validation-body">
            <!-- Summary -->
            <div class="validation-summary">
              <div class="summary-item success">
                <span class="summary-icon">✅</span>
                <span class="summary-text"
                  >{{ totalInstructions() - errorCount() - warningCount() }} valid</span
                >
              </div>
              @if (warningCount() > 0) {
                <div class="summary-item warning">
                  <span class="summary-icon">⚠️</span>
                  <span class="summary-text">{{ warningCount() }} warnings</span>
                </div>
              }
              @if (errorCount() > 0) {
                <div class="summary-item error">
                  <span class="summary-icon">❌</span>
                  <span class="summary-text">{{ errorCount() }} errors</span>
                </div>
              }
            </div>

            <!-- Issues List -->
            @if (issues().length > 0) {
              <div class="validation-issues">
                <div class="issues-header">
                  <span>Issues ({{ issues().length }})</span>
                  <button
                    class="btn-clear"
                    (click)="clearAll()"
                    (keydown.enter)="clearAll()"
                    (keydown.space)="clearAll()"
                    tabindex="0"
                  >
                    Clear All
                  </button>
                </div>

                <div class="issues-list">
                  @for (issue of issues(); track $index) {
                    <div
                      class="issue-item issue-{{ issue.type }}"
                      [class.clickable]="issue.location"
                      [tabindex]="issue.location ? 0 : -1"
                      (click)="onIssueClick(issue)"
                      (keydown.enter)="issue.location && onIssueClick(issue)"
                      (keydown.space)="issue.location && onIssueClick(issue)"
                    >
                      <span class="issue-icon">
                        {{ issue.type === 'error' ? '❌' : '⚠️' }}
                      </span>
                      <div class="issue-content">
                        <div class="issue-message">{{ issue.message }}</div>
                        @if (issue.location) {
                          <div class="issue-location">
                            Page {{ issue.location.page + 1 }}, Cell [{{ issue.location.x }},
                            {{ issue.location.y }}]
                          </div>
                        }
                      </div>
                      @if (issue.action) {
                        <button class="issue-action">
                          {{ issue.action }}
                        </button>
                      }
                    </div>
                  }
                </div>
              </div>
            } @else {
              <div class="no-issues">
                <div class="no-issues-icon">✨</div>
                <div class="no-issues-text">No validation issues found!</div>
                <div class="no-issues-subtext">Your program looks great.</div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .validation-panel {
        position: fixed;
        bottom: var(--md-sys-spacing-3);
        right: var(--md-sys-spacing-3);
        z-index: 1030;
        max-width: 400px;
        transition: all var(--md-sys-transition);
      }

      .validation-toggle {
        display: flex;
        align-items: center;
        gap: var(--md-sys-spacing-1);
        padding: var(--md-sys-spacing-1) var(--md-sys-spacing-3);
        background: var(--md-sys-color-surface);
        border: 1px solid var(--md-sys-color-outline);
        border-radius: var(--md-sys-corner-full);
        color: var(--md-sys-color-on-surface);
        font-size: var(--md-sys-typescale-label);
        font-weight: var(--md-sys-font-weight-medium);
        cursor: pointer;
        box-shadow: var(--md-sys-shadow-md);
        transition: all var(--md-sys-transition-fast);
      }

      .validation-toggle:hover {
        transform: translateY(-2px);
        box-shadow: var(--md-sys-shadow-lg);
        border-color: var(--md-sys-color-primary);
        color: var(--md-sys-color-primary);
      }

      .validation-toggle.has-issues {
        animation: pulse 2s ease-in-out infinite;
        border-color: var(--md-sys-color-error);
      }

      @keyframes pulse {
        0%,
        100% {
          box-shadow: var(--md-sys-shadow-md);
        }
        50% {
          box-shadow:
            var(--md-sys-shadow-lg),
            0 0 0 3px rgba(239, 68, 68, 0.2);
        }
      }

      .validation-icon {
        font-size: 16px;
        line-height: 1;
      }

      .validation-count {
        white-space: nowrap;
      }

      .validation-content {
        position: absolute;
        bottom: calc(100% + 12px);
        right: 0;
        width: 400px;
        max-height: 500px;
        background: var(--md-sys-color-surface);
        border: 1px solid var(--md-sys-color-outline);
        border-radius: var(--md-sys-corner-lg);
        box-shadow: var(--md-sys-shadow-lg);
        overflow: hidden;
        animation: md-slide-down 0.3s ease-out;
        display: flex;
        flex-direction: column;
      }

      .validation-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--md-sys-spacing-2) var(--md-sys-spacing-3);
        border-bottom: 1px solid var(--md-sys-color-outline-variant);
        background: var(--md-sys-color-surface);
      }

      .validation-title {
        margin: 0;
        font-size: var(--md-sys-typescale-title);
        font-weight: var(--md-sys-font-weight-medium);
        color: var(--md-sys-color-on-surface);
      }

      .validation-close {
        width: 28px;
        height: 28px;
        padding: 0;
        background: transparent;
        border: none;
        color: var(--md-sys-color-on-surface-variant);
        font-size: 20px;
        line-height: 1;
        cursor: pointer;
        border-radius: var(--md-sys-corner-full);
        transition: all var(--md-sys-transition-fast);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .validation-close:hover {
        background: var(--md-sys-color-surface-variant);
        color: var(--md-sys-color-on-surface);
      }

      .validation-body {
        max-height: 400px;
        overflow-y: auto;
        flex: 1;
      }

      .validation-summary {
        display: flex;
        gap: var(--md-sys-spacing-1);
        padding: var(--md-sys-spacing-2);
        background: var(--md-sys-color-surface-variant);
      }

      .summary-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: var(--md-sys-spacing-1);
        background: var(--md-sys-color-surface);
        border-radius: var(--md-sys-corner-sm);
        border-left: 3px solid;
      }

      .summary-item.success {
        border-left-color: var(--md-sys-color-success);
      }

      .summary-item.warning {
        border-left-color: var(--md-sys-color-warning);
      }

      .summary-item.error {
        border-left-color: var(--md-sys-color-error);
      }

      .summary-icon {
        font-size: 18px;
      }

      .summary-text {
        font-size: var(--md-sys-typescale-caption);
        font-weight: var(--md-sys-font-weight-medium);
        color: var(--md-sys-color-on-surface-variant);
      }

      .validation-issues {
        padding: var(--md-sys-spacing-2);
      }

      .issues-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--md-sys-spacing-2);
        font-size: var(--md-sys-typescale-label);
        font-weight: var(--md-sys-font-weight-medium);
        color: var(--md-sys-color-on-surface);
      }

      .btn-clear {
        padding: 4px 12px;
        background: var(--md-sys-color-surface-variant);
        border: 1px solid var(--md-sys-color-outline-variant);
        border-radius: var(--md-sys-corner-full);
        color: var(--md-sys-color-on-surface-variant);
        font-size: var(--md-sys-typescale-caption);
        cursor: pointer;
        transition: all var(--md-sys-transition-fast);
      }

      .btn-clear:hover {
        background: rgba(239, 68, 68, 0.1);
        border-color: var(--md-sys-color-error);
        color: var(--md-sys-color-error);
      }

      .issues-list {
        display: flex;
        flex-direction: column;
        gap: var(--md-sys-spacing-1);
      }

      .issue-item {
        display: flex;
        align-items: flex-start;
        gap: var(--md-sys-spacing-2);
        padding: var(--md-sys-spacing-2);
        background: var(--md-sys-color-surface-variant);
        border-radius: var(--md-sys-corner-sm);
        border-left: 3px solid;
        transition: all var(--md-sys-transition-fast);
      }

      .issue-item.issue-error {
        border-left-color: var(--md-sys-color-error);
      }

      .issue-item.issue-warning {
        border-left-color: var(--md-sys-color-warning);
      }

      .issue-item.clickable {
        cursor: pointer;
      }

      .issue-item.clickable:hover {
        background: var(--md-sys-color-surface-container);
        transform: translateX(-2px);
      }

      .issue-icon {
        font-size: 16px;
        line-height: 1;
        flex-shrink: 0;
      }

      .issue-content {
        flex: 1;
        min-width: 0;
      }

      .issue-message {
        font-size: var(--md-sys-typescale-body);
        color: var(--md-sys-color-on-surface);
        margin-bottom: 4px;
        word-break: break-word;
      }

      .issue-location {
        font-size: var(--md-sys-typescale-caption);
        color: var(--md-sys-color-on-surface-variant);
        font-family: 'Roboto Mono', monospace;
      }

      .issue-action {
        padding: 4px 12px;
        background: var(--md-sys-color-primary);
        border: none;
        border-radius: var(--md-sys-corner-full);
        color: var(--md-sys-color-on-primary);
        font-size: var(--md-sys-typescale-caption);
        font-weight: var(--md-sys-font-weight-medium);
        cursor: pointer;
        transition: background var(--md-sys-transition-fast);
        flex-shrink: 0;
      }

      .issue-action:hover {
        background: var(--md-sys-color-primary-hover);
      }

      .no-issues {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--md-sys-spacing-6) var(--md-sys-spacing-3);
        text-align: center;
      }

      .no-issues-icon {
        font-size: 48px;
        margin-bottom: 16px;
      }

      .no-issues-text {
        font-size: var(--md-sys-typescale-title);
        font-weight: var(--md-sys-font-weight-medium);
        color: var(--md-sys-color-on-surface);
        margin-bottom: 4px;
      }

      .no-issues-subtext {
        font-size: var(--md-sys-typescale-body);
        color: var(--md-sys-color-on-surface-variant);
      }

      @media (max-width: 640px) {
        .validation-panel {
          left: 12px;
          right: 12px;
          max-width: none;
        }

        .validation-content {
          width: 100%;
        }
      }
    `,
  ],
})
export class ValidationPanelComponent {
  private readonly programService = inject(ProgramService);

  isOpen = signal(false);
  issues = signal<ValidationIssue[]>([]);

  errorCount = computed(() => this.issues().filter((i) => i.type === 'error').length);
  warningCount = computed(() => this.issues().filter((i) => i.type === 'warning').length);
  hasIssues = computed(() => this.issues().length > 0);

  // Count only non-empty instructions (not ProgAction.None = 0)
  totalInstructions = computed(() => {
    const instructions = this.programService.getAllInstructions();
    return instructions.filter((inst) => inst.action !== 0).length;
  });

  toggle(): void {
    this.isOpen.update((open) => !open);
    if (this.isOpen()) {
      this.refreshValidation();
    }
  }

  open(): void {
    this.isOpen.set(true);
    this.refreshValidation();
  }

  close(): void {
    this.isOpen.set(false);
  }

  refreshValidation(): void {
    const validation = this.programService.validateProgram();

    const issues: ValidationIssue[] = [
      ...validation.errors.map((e) => ({
        type: 'error' as const,
        message: e.message,
        location: undefined,
      })),
      ...validation.warnings.map((w) => ({
        type: 'warning' as const,
        message: w.message,
        location: undefined,
      })),
    ];

    this.issues.set(issues);
  }

  clearAll(): void {
    this.issues.set([]);
  }

  onIssueClick(issue: ValidationIssue): void {
    if (issue.location) {
      // Navigate to the cell with the issue
      this.programService.currentPage.set(issue.location.page);
      // Optionally: highlight the cell or scroll to it
      console.log(
        `Navigate to page ${issue.location.page}, cell [${issue.location.x}, ${issue.location.y}]`,
      );
    }
  }
}
