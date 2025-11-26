import { BaseDialog } from "./BaseDialog.js";
import { Component } from "../../../../core/utils/Component.js";
import { createButton } from "../../../../core/utils/dom-utils.js";

export class InfoDialog extends BaseDialog {
  constructor(message, title = "Info") {
    super(title);
    this.message = message;
  }

  create() {
    super.create();

    const content = Component.create("div")
      .style({ padding: "0.5rem 0" })
      .text(this.message)
      .render();

    this.setContent(content);

    const footer = Component.create("div")
      .class("dialog-buttons")
      .style({ display: "flex", justifyContent: "flexEnd", gap: "0.5rem" })
      .child(
        createButton({
          id: "ok-btn",
          text: "OK",
          className: "btn-primary",
          onClick: () => this.close(true),
        }),
      )
      .render();

    this.setFooter(footer);
  }
}
