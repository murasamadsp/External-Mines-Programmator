import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

interface Snippet {
  name: string;
  icon: string;
  description: string;
  pattern: string[];
}

@Component({
  selector: 'app-snippets-panel',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './snippets-panel.html',
  styleUrls: ['./snippets-panel.css'],
})
export class SnippetsPanelComponent {
  snippets = signal<Snippet[]>(this.getDefaultSnippets());

  onSnippetClick(snippet: Snippet) {
    console.log(`📋 Snippet selected: ${snippet.name}`);
    // TODO: Implement snippet insertion into program grid
    alert(
      `Snippet "${snippet.name}" selected.\n\nPattern:\n${snippet.pattern.join('\n')}\n\n(Insertion feature coming soon)`,
    );
  }

  onSnippetKeyDown(event: KeyboardEvent, snippet: Snippet) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onSnippetClick(snippet);
    }
  }

  private getDefaultSnippets(): Snippet[] {
    return [
      {
        name: 'Move Forward Loop',
        icon: '🔄',
        description: 'Move forward in a loop',
        pattern: ['Move Up', 'Move Up', 'Move Up', 'Jump to Start'],
      },
      {
        name: 'Safe Mining',
        icon: '⛏️',
        description: 'Check before mining',
        pattern: ['Check Tile', 'Jump if Safe', 'Mine', 'Move Up'],
      },
      {
        name: 'Spiral Pattern',
        icon: '🌀',
        description: 'Spiral movement pattern',
        pattern: ['Move Up', 'Turn Right', 'Move Up', 'Turn Right', 'Move Up', 'Move Up'],
      },
      {
        name: 'Boundary Check',
        icon: '🚧',
        description: 'Check grid boundaries',
        pattern: ['Check Tile', 'Jump if Edge', 'Move Up', 'Jump to Start'],
      },
      {
        name: 'Resource Gather',
        icon: '💎',
        description: 'Collect resources efficiently',
        pattern: ['Check Tile', 'Mine', 'Move Right', 'Check Tile', 'Mine'],
      },
      {
        name: 'Return Home',
        icon: '🏠',
        description: 'Navigate back to start',
        pattern: ['Turn Around', 'Move Up', 'Move Up', 'Jump to Start'],
      },
    ];
  }
}
