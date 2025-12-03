import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { ACTION_METADATA } from '../../../../core/data/action-metadata';
import { ACTION_CATEGORIES } from '../../../../core/data/action-categories';
import { getActionCode } from '../../../../core/utils/action-utils';
import { ProgAction } from '../../../../core/models/program.model';
import { CellInteractionService } from '../../../../core/services/cell-interaction.service';

interface CategoryState {
  collapsed: boolean;
}

@Component({
  selector: 'app-action-palette',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatExpansionModule,
    MatButtonModule,
  ],
  templateUrl: './action-palette.html',
  styleUrls: ['./action-palette.css'],
})
export class ActionPaletteComponent {
  selectedAction = signal<string | null>(null);
  categoryStates = signal<Map<string, CategoryState>>(new Map());

  // Get categories in order
  categoryKeys = Object.keys(ACTION_CATEGORIES);

  private readonly cellInteractionService = inject(CellInteractionService);

  constructor() {
    // Load collapsed categories from localStorage
    this.loadCollapsedCategories();

    // Debug logging
    console.log('🎨 ActionPalette initialized');
    const sampleAction = 'MoveUp';
    const code = getActionCode(sampleAction);
    console.log(`🔍 Debug check: Action "${sampleAction}" -> Code: ${code}`);
    console.log('📋 Categories:', Object.keys(ACTION_CATEGORIES));
  }

  // Computed actions for each category
  getCategoryActions(category: string): string[] {
    return ACTION_CATEGORIES[category] || [];
  }

  // Get action metadata
  getActionData(actionKey: string) {
    const metadata = ACTION_METADATA[actionKey];
    const code = getActionCode(actionKey);
    return {
      key: actionKey,
      label: metadata?.label || actionKey,
      tooltip: metadata?.tooltip || actionKey,
      code: code || 0,
    };
  }

  selectAction(actionKey: string) {
    // Toggle selection if clicking the same action
    if (this.selectedAction() === actionKey) {
      this.selectedAction.set(null);
      this.cellInteractionService.setSelectedAction(null);
    } else {
      this.selectedAction.set(actionKey);
      const code = getActionCode(actionKey);
      this.cellInteractionService.setSelectedAction(code as ProgAction);
    }
  }

  isSelected(actionKey: string): boolean {
    return this.selectedAction() === actionKey;
  }

  toggleCategory(category: string) {
    const states = this.categoryStates();
    const currentState = states.get(category) || { collapsed: false };
    currentState.collapsed = !currentState.collapsed;
    states.set(category, currentState);
    this.categoryStates.set(new Map(states));
    this.saveCollapsedCategories();
  }

  onCategoryKeyDown(event: KeyboardEvent, category: string) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleCategory(category);
    }
  }

  isCategoryCollapsed(category: string): boolean {
    const state = this.categoryStates().get(category);
    return state?.collapsed || false;
  }

  getCategoryToggleIcon(category: string): string {
    return this.isCategoryCollapsed(category) ? '▶' : '▼';
  }

  private loadCollapsedCategories() {
    try {
      const collapsed = localStorage.getItem('emp_collapsed_categories');
      if (collapsed) {
        const collapsedList: string[] = JSON.parse(collapsed);
        const states = new Map<string, CategoryState>();
        collapsedList.forEach((cat) => {
          states.set(cat, { collapsed: true });
        });
        this.categoryStates.set(states);
      }
    } catch (error) {
      console.warn('Failed to load collapsed categories:', error);
    }
  }

  private saveCollapsedCategories() {
    try {
      const collapsed: string[] = [];
      this.categoryStates().forEach((state, category) => {
        if (state.collapsed) {
          collapsed.push(category);
        }
      });
      localStorage.setItem('emp_collapsed_categories', JSON.stringify(collapsed));
    } catch (error) {
      console.warn('Failed to save collapsed categories:', error);
    }
  }

  // Drag and drop support
  onDragStart(event: DragEvent, actionKey: string) {
    if (!event.dataTransfer) return;

    const actionData = this.getActionData(actionKey);
    const payload = {
      action: actionData.code,
      key: actionKey,
    };

    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('application/json', JSON.stringify(payload));

    // Create custom drag image
    const dragImage = document.createElement('div');
    dragImage.textContent = actionData.label;
    dragImage.style.cssText = `
      position: absolute;
      top: -1000px;
      padding: 8px 16px;
      background: var(--color-primary);
      color: white;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
    `;
    document.body.appendChild(dragImage);
    event.dataTransfer.setDragImage(dragImage, 0, 0);
    setTimeout(() => dragImage.remove(), 0);
  }
}
