import { Component, computed, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanzoomObject } from '@panzoom/panzoom';
import { ProgramService } from '../../../../core/services/program.service';
import { CellInteractionService } from '../../../../core/services/cell-interaction.service';
import { Instruction, ProgAction } from '../../../../core/models/program.model';
import { getActionByCode, getActionMetadata } from '../../../../core/utils/action-utils';

@Component({
  selector: 'app-program-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './program-grid.html',
  styleUrls: ['./program-grid.css'],
})
export class ProgramGridComponent {
  @Input() panzoomInstance!: PanzoomObject;

  // Use the current page from ProgramService
  currentPage = computed(() => this.programService.currentPage());

  // Computed instructions for the current page
  pageInstructions = computed(() => {
    return this.programService.getPageInstructions(this.currentPage());
  });

  public readonly programService = inject(ProgramService);
  private readonly cellInteractionService = inject(CellInteractionService);

  /**
   * Handle cell click - delegates to CellInteractionService
   */
  async onCellClick(index: number) {
    const x = index % 16;
    const y = Math.floor(index / 16);
    const page = this.currentPage();

    await this.cellInteractionService.onCellClick(x, y, page);
  }

  /**
   * Handle keyboard events for cell
   */
  onCellKeyDown(event: KeyboardEvent, index: number) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onCellClick(index);
    }
  }

  /**
   * Drag and drop handlers
   */
  onDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  /**
   * Handle drop - uses CellInteractionService for action placement
   */
  async onDrop(event: DragEvent) {
    event.preventDefault();

    try {
      const data = event.dataTransfer?.getData('application/json');
      if (!data) return;

      const payload = JSON.parse(data);
      if (payload.action !== undefined) {
        const gridElement = (event.currentTarget as HTMLElement);
        const rect = gridElement.getBoundingClientRect();
        const scale = this.panzoomInstance.getScale();

        // Adjust for panzoom's transform
        const pan = this.panzoomInstance.getPan();
        const x = (event.clientX - rect.left - pan.x) / scale;
        const y = (event.clientY - rect.top - pan.y) / scale;

        // Calculate cell index from DOM
        const firstCell = gridElement.querySelector('.program-cell');
        if (!firstCell) return;
        const cellWidth = firstCell.offsetWidth;
        const cellHeight = firstCell.offsetHeight;
        const gap = 4; // from CSS

        const col = Math.floor(x / (cellWidth + gap));
        const row = Math.floor(y / (cellHeight + gap));

        if (col >= 0 && col < 16 && row >= 0 && row < 12) {
          const page = this.currentPage();
          // Use CellInteractionService to place action with proper dialogs
          await this.cellInteractionService.placeActionAt(col, row, payload.action, page);
        }
      }
    } catch (error) {
      console.error('Drop handling error:', error);
    }
  }

  /**
   * Helper to get cell display data
   */
  getCellData(instruction: Instruction) {
    if (!instruction || instruction.action === ProgAction.None) {
      return null;
    }

    const actionInfo = getActionByCode(instruction.action);
    if (!actionInfo) {
      return {
        emoji: '❓',
        name: String(instruction.action),
        value: null,
        tooltip: 'Unknown',
      };
    }

    const metadata = getActionMetadata(actionInfo.name);
    const labelText = metadata?.label || actionInfo.name;

    // Extract emoji from label
    const match = labelText.match(
      /^([\u{1F300}-\u{1F9FF}\u2700-\u27BF\u2600-\u26FF\u2000-\u3300\u{1F000}-\u{1FAFF}↑↓←→↖↗↘↙↺↻]+)\s*(.*)/u,
    );
    const emoji = match ? match[1] : '';
    const name = match ? match[2] : labelText;

    // Format value text
    let valueText = '';
    if (instruction.label) {
      if (instruction.label.includes(':')) {
        valueText = instruction.label.replace(':', '→');
      } else {
        valueText = instruction.label;
      }
    }

    if (instruction.value !== null && instruction.value !== undefined) {
      valueText += (valueText ? '=' : '') + instruction.value;
    }

    return {
      emoji,
      name,
      value: valueText,
      tooltip: metadata?.tooltip || actionInfo.name,
      actionCode: instruction.action,
      category: metadata?.category || 'Unknown',
    };
  }
}
