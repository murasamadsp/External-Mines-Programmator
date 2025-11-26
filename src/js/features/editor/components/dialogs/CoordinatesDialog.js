import { BaseDialog } from "./BaseDialog.js";
import { Component } from "../../../../core/utils/Component.js";
import { createInput, createButton } from "../../../../core/utils/dom-utils.js";

export class CoordinatesDialog extends BaseDialog {
  constructor(defaultX = 0, defaultY = 0) {
    super("📍 Enter Coordinates");
    this.defaultX = defaultX;
    this.defaultY = defaultY;
  }

  create() {
    super.create();

    const inputX = createInput({
      id: "coord-x",
      type: "number",
      value: this.defaultX.toString(),
      placeholder: "X (0-255)",
      onKeyDown: e => {
        if (e.key === "Enter") document.getElementById("coord-y").focus();
        if (e.key === "Escape") this.close(null);
      },
    });

    const inputY = createInput({
      id: "coord-y",
      type: "number",
      value: this.defaultY.toString(),
      placeholder: "Y (0-255)",
      onKeyDown: e => {
        if (e.key === "Enter") this.submit();
        if (e.key === "Escape") this.close(null);
      },
    });

    const errorMsg = Component.create("div")
      .class("dialog-error")
      .style({
        color: "#ef4444",
        fontSize: "0.875rem",
        marginTop: "0.5rem",
        minHeight: "1.25rem",
      })
      .render();

    const content = Component.create("div")
      .style({ display: "flex", flexDirection: "column", gap: "1rem" })
      .child(
        Component.create("div")
          .child(
            Component.create("label")
              .style({
                display: "block",
                marginBottom: "0.25rem",
                color: "#9ca3af",
              })
              .text("X Coordinate:"),
          )
          .child(inputX),
      )
      .child(
        Component.create("div")
          .child(
            Component.create("label")
              .style({
                display: "block",
                marginBottom: "0.25rem",
                color: "#9ca3af",
              })
              .text("Y Coordinate:"),
          )
          .child(inputY),
      )
      .child(errorMsg)
      .render();

    this.setContent(content);

    const footer = Component.create("div")
      .class("dialog-buttons")
      .style({ display: "flex", justifyContent: "flexEnd", gap: "0.5rem" })
      .child(
        createButton({
          id: "cancel-btn",
          text: "Cancel",
          className: "btn-secondary",
          onClick: () => this.close(null),
        }),
      )
      .child(
        createButton({
          id: "submit-btn",
          text: "Save",
          className: "btn-primary",
          onClick: () => this.submit(),
        }),
      )
      .render();

    this.setFooter(footer);

    // NOTE: Autofocus removed due to buggy browser extension interference
    // User needs to click the input field manually
  }

  submit() {
    const inputX = this.dialog.querySelector("#coord-x");
    const inputY = this.dialog.querySelector("#coord-y");
    const errorMsg = this.dialog.querySelector(".dialog-error");

    const x = parseInt(inputX.value);
    const y = parseInt(inputY.value);

    if (isNaN(x) || x < 0 || x > 255) {
      errorMsg.textContent = "Invalid X coordinate! Must be 0-255.";
      return;
    }

    if (isNaN(y) || y < 0 || y > 255) {
      errorMsg.textContent = "Invalid Y coordinate! Must be 0-255.";
      return;
    }

    this.close({ x, y });
  }
}
