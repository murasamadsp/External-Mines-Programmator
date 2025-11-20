// Snippets Panel - provides quick access to common program patterns
// Displays pre-built code snippets that users can insert into their programs

import { loggers } from "../../../utils/index.js";
import { ProgAction } from "../../../core/index.js";
import { UI_TIMEOUTS } from "../../../core/constants/ui-constants.js";

export class SnippetsPanel {
  constructor(container) {
    this.container = container;
    this.snippets = this.getDefaultSnippets();
    loggers.ui.debug("🧩 SnippetsPanel initialized");
  }

  /**
   * Creates the snippets panel UI
   */
  create() {
    const panel = document.createElement("div");
    panel.id = "snippets-panel";

    // Title
    const title = document.createElement("h3");
    title.textContent = "📝 Snippets";
    panel.appendChild(title);

    // Description
    const description = document.createElement("p");
    description.className = "snippets-description";
    description.textContent = "Quick patterns for common tasks";
    panel.appendChild(description);

    // Snippets container
    const snippetsContainer = document.createElement("div");
    snippetsContainer.className = "snippets-container";

    this.snippets.forEach(snippet => {
      const snippetCard = this.createSnippetCard(snippet);
      snippetsContainer.appendChild(snippetCard);
    });

    panel.appendChild(snippetsContainer);
    this.container.appendChild(panel);

    loggers.ui.info("✅ Snippets panel created");
  }

  /**
   * Creates a snippet card element
   */
  createSnippetCard(snippet) {
    const card = document.createElement("div");
    card.className = "snippet-card";

    // Icon
    const icon = document.createElement("div");
    icon.className = "snippet-icon";
    icon.textContent = snippet.icon;
    card.appendChild(icon);

    // Content
    const content = document.createElement("div");
    content.className = "snippet-content";

    const name = document.createElement("div");
    name.className = "snippet-name";
    name.textContent = snippet.name;
    content.appendChild(name);

    const desc = document.createElement("div");
    desc.className = "snippet-description";
    desc.textContent = snippet.description;
    content.appendChild(desc);

    card.appendChild(content);

    // Click handler
    card.addEventListener("click", () => {
      this.onSnippetClick(snippet);
    });

    // Keyboard support
    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.onSnippetClick(snippet);
      }
    });

    return card;
  }

  /**
   * Handles snippet click
   */
  onSnippetClick(snippet) {
    loggers.ui.info(`📋 Snippet selected: ${snippet.name}`);
    alert(`Snippet "${snippet.name}" selected. (Feature stub)`);
  }

  /**
   * Formats snippet pattern for display/copy
   */
  formatSnippetPattern(snippet) {
    return `${snippet.name}\n${snippet.description}\n\nPattern:\n${snippet.pattern.join("\n")}`;
  }

  /**
   * Shows visual feedback when snippet is copied
   */
  showCopyFeedback() {
    const feedback = document.createElement("div");
    feedback.className = "snippet-feedback";
    feedback.textContent = "✓ Copied to clipboard!";
    this.container.appendChild(feedback);

    setTimeout(() => {
      feedback.remove();
    }, UI_TIMEOUTS.notification);
  }

  /**
   * Returns default snippets
   */
  getDefaultSnippets() {
    return [
      {
        name: "Move Forward Loop",
        icon: "🔄",
        description: "Move forward in a loop",
        pattern: ["Move Up", "Move Up", "Move Up", "Jump to Start"],
      },
      {
        name: "Safe Mining",
        icon: "⛏️",
        description: "Check before mining",
        pattern: ["Check Tile", "Jump if Safe", "Mine", "Move Up"],
      },
      {
        name: "Spiral Pattern",
        icon: "🌀",
        description: "Spiral movement pattern",
        pattern: [
          "Move Up",
          "Turn Right",
          "Move Up",
          "Turn Right",
          "Move Up",
          "Move Up",
        ],
      },
      {
        name: "Boundary Check",
        icon: "🚧",
        description: "Check grid boundaries",
        pattern: ["Check Tile", "Jump if Edge", "Move Up", "Jump to Start"],
      },
      {
        name: "Resource Gather",
        icon: "💎",
        description: "Collect resources efficiently",
        pattern: ["Check Tile", "Mine", "Move Right", "Check Tile", "Mine"],
      },
      {
        name: "Return Home",
        icon: "🏠",
        description: "Navigate back to start",
        pattern: ["Turn Around", "Move Up", "Move Up", "Jump to Start"],
      },
    ];
  }

  /**
   * Destroys the snippets panel
   */
  destroy() {
    const panel = this.container.querySelector("#snippets-panel");
    if (panel) {
      panel.remove();
    }
    loggers.ui.debug("🗑️ SnippetsPanel destroyed");
  }
}
