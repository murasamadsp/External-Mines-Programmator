import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgramService } from '../../../../core/services/program.service';
import { ProgAction } from '../../../../core/models/program.model';

interface AnalysisResult {
  totalInstructions: number;
  nonEmptyInstructions: number;
  emptyInstructions: number;
  uniqueActions: number;
  uniqueLabels: number;
  labels: string[];
  gotoTargets: string[];
  errors: string[];
  warnings: string[];
}

@Component({
  selector: 'app-analyzer-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analyzer-dialog.html',
  styleUrls: ['./analyzer-dialog.css'],
})
export class AnalyzerDialogComponent {
  isVisible = signal(false);
  analysisResult = signal<AnalysisResult | null>(null);

  private readonly programService = inject(ProgramService);

  open() {
    this.isVisible.set(true);
    this.analyze();
  }

  close() {
    this.isVisible.set(false);
  }

  analyze() {
    const instructions = this.programService.instructions();

    // Count actions
    const actionCounts = new Map<number, number>();
    const nonEmptyCount = instructions.filter((inst) => inst.action !== ProgAction.None).length;

    instructions.forEach((inst) => {
      if (inst.action !== ProgAction.None) {
        const count = actionCounts.get(inst.action) || 0;
        actionCounts.set(inst.action, count + 1);
      }
    });

    // Count labels and goto targets
    const labels = new Set<string>();
    const gotoTargets = new Set<string>();
    const errors: string[] = [];
    const warnings: string[] = [];

    instructions.forEach((inst) => {
      if (inst.action === ProgAction.Label && inst.label) {
        labels.add(inst.label);
      }
      if ((inst.action === ProgAction.Goto || inst.action === ProgAction.Call) && inst.label) {
        gotoTargets.add(inst.label);
      }
    });

    // Check for undefined goto targets
    gotoTargets.forEach((target) => {
      if (!labels.has(target)) {
        errors.push(`Goto/Call to undefined label "${target}"`);
      }
    });

    // Check for unreferenced labels
    labels.forEach((label) => {
      if (!gotoTargets.has(label)) {
        warnings.push(`Unreferenced label "${label}"`);
      }
    });

    this.analysisResult.set({
      totalInstructions: instructions.length,
      nonEmptyInstructions: nonEmptyCount,
      emptyInstructions: instructions.length - nonEmptyCount,
      uniqueActions: actionCounts.size,
      uniqueLabels: labels.size,
      labels: Array.from(labels),
      gotoTargets: Array.from(gotoTargets),
      errors,
      warnings,
    });
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('dialog-backdrop')) {
      this.close();
    }
  }

  onEscapeKey(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.close();
    }
  }
}
