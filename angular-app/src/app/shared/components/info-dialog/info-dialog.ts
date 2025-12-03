import { Component, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BaseDialogComponent, DialogResult } from "../base-dialog/base-dialog";

@Component({
  selector: "app-info-dialog",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./info-dialog.html",
  styleUrls: ["../base-dialog/base-dialog.css", "./info-dialog.css"],
})
export class InfoDialogComponent extends BaseDialogComponent<void> {
  title = "Info";
  message = signal("");

  /**
   * Opens the info dialog with specified message and title
   */
  openWithParams(
    message: string,
    customTitle = "Info",
  ): Promise<DialogResult<void> | null> {
    this.message.set(message);
    this.title = customTitle;
    return this.open();
  }

  protected validate(): boolean {
    return true; // No validation needed for info dialog
  }

  protected getValue(): void {
    return undefined; // Info dialog doesn't return a value
  }

  onOk() {
    this.close({ confirmed: true });
  }
}
