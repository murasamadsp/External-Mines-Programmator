---
name: angular-dialog
description: Generates an Angular dialog component extending BaseDialogComponent
---

# Angular Dialog Generator

This skill helps you generate Angular dialog components that integrate with the project's dialog system by extending `BaseDialogComponent`.

## Usage

When creating a new dialog, use this template:

### TypeScript (`{{name}}-dialog.ts`)
```typescript
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { BaseDialogComponent } from "../../../shared/components/base-dialog/base-dialog";

@Component({
  selector: "app-{{name}}-dialog",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./{{name}}-dialog.html",
  styleUrls: ["../../../shared/components/base-dialog/base-dialog.css"], // Reuse base styles
})
export class {{Name}}DialogComponent extends BaseDialogComponent<{{ReturnType}}> {
  title = "{{Dialog Title}}";
  // Define model properties here
  inputValue: string = "";

  protected validate(): boolean {
    // Return true if valid, false otherwise
    return this.inputValue.length > 0;
  }

  protected getValue(): {{ReturnType}} {
    // Return the value to be passed back to the caller
    return this.inputValue;
  }
}
```

### HTML (`{{name}}-dialog.html`)
```html
<div class="dialog-overlay" *ngIf="visible()" (click)="onOverlayClick($event)">
  <div class="dialog-content">
    <div class="dialog-header">
      <h2>{{ title }}</h2>
      <button class="close-btn" (click)="cancel()">×</button>
    </div>
    
    <div class="dialog-body">
      <!-- Content goes here -->
      <div class="form-group">
        <label>Input Label</label>
        <input type="text" [(ngModel)]="inputValue" (keydown.enter)="submit()">
      </div>
    </div>

    <div class="dialog-footer">
      <button class="btn-secondary" (click)="cancel()">Cancel</button>
      <button class="btn-primary" (click)="submit()">Confirm</button>
    </div>
  </div>
</div>
```

## Key Principles
- Extend `BaseDialogComponent<T>`.
- Implement `validate()` and `getValue()`.
- Use `visible()` signal for visibility.
- Reuse `base-dialog.css` for consistent styling.
- Use `(click)="onOverlayClick($event)"` on the overlay.
