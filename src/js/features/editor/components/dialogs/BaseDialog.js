import { Component } from "../../../../core/utils/Component.js";
import { loggers } from "../../../../utils/logging/logger.js";

export class BaseDialog {
  constructor(title) {
    this.title = title;
    this.overlay = null;
    this.dialog = null;
    this.resolve = null;
  }

  create() {
    // Create Overlay
    this.overlay = Component.create("div")
      .class("dialog-overlay")
      .style({
        visibility: "hidden",
        opacity: "0",
      })
      .on("click", () => this.close(null))
      .render();

    // Create Dialog Container
    this.dialog = Component.create("div")
      .class("dialog-content")
      .on("click", e => e.stopPropagation()) // Prevent closing when clicking inside
      .child(Component.create("h3").text(this.title))
      .child(Component.create("div").class("dialog-body")) // Content placeholder
      // Footer will be added by subclasses or setFooter
      .render();

    this.overlay.appendChild(this.dialog);
    document.body.appendChild(this.overlay);
  }

  setContent(content) {
    const body = this.dialog.querySelector(".dialog-body");
    if (!body) return;

    body.innerHTML = "";
    if (content instanceof HTMLElement) {
      body.appendChild(content);
    } else {
      body.textContent = content;
    }
  }

  setFooter(content) {
    // Remove existing footer
    const existing = this.dialog.querySelector(".dialog-buttons");
    if (existing) existing.remove();

    if (content instanceof HTMLElement) {
      if (!content.classList.contains("dialog-buttons")) {
        content.classList.add("dialog-buttons");
      }
      this.dialog.appendChild(content);
    }
  }

  async open() {
    loggers.ui.debug(`Open Dialog: ${this.title}`);
    this.create();

    this.overlay.style.visibility = "visible";
    this.overlay.style.opacity = "1";
    this.dialog.style.opacity = "1";
    this.dialog.style.transform = "none";

    return new Promise(resolve => {
      this.resolve = resolve;
    });
  }

  close(result) {
    loggers.ui.debug(`Close Dialog: ${this.title} with result: ${result}`);
    if (!this.overlay) return;

    this.cleanup(result);
  }

  cleanup(result) {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    if (this.resolve) {
      this.resolve(result);
      this.resolve = null;
    }
  }
}
