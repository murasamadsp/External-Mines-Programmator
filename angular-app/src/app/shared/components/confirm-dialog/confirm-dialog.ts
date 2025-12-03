import { Component, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BaseDialogComponent, DialogResult } from "../base-dialog/base-dialog";

@Component({
  selector: "app-confirm-dialog",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./confirm-dialog.html",
  styleUrls: ["../base-dialog/base-dialog.css", "./confirm-dialog.css"],
})
export class ConfirmDialogComponent extends BaseDialogComponent<boolean> {
  title = "Confirm";
  message = signal("");

  /**
   * Opens the confirm dialog with specified message and title
   */
  openWithParams(
    message: string,
    customTitle = "Confirm",
  ): Promise<DialogResult<boolean> | null> {
    this.message.set(message);
    this.title = customTitle;
    return this.open();
  }

  protected validate(): boolean {
    return true; // No validation needed for confirm dialog
  }

  protected getValue(): boolean {
    return true; // User confirmed
  }

  onConfirm() {
    this.close({ confirmed: true, value: true });
  }

  onCancel() {
    this.close({ confirmed: false, value: false });
  }
}
