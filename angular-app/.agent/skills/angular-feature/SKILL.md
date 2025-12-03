---
name: angular-feature
description: Generates an Angular feature component (Standalone, OnPush)
---

# Angular Feature Component Generator

This skill helps you generate Angular feature components following the project's standards: Standalone, OnPush change detection, and separate HTML/CSS files.

## Usage

When creating a new feature component, use this template:

```typescript
import { Component, ChangeDetectionStrategy, signal } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-{{name}}",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./{{name}}.component.html",
  styleUrls: ["./{{name}}.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class {{Name}}Component {
  // State
  // Use signals for local state
  
  constructor() {}
}
```

## Key Principles
- **Standalone**: Always `standalone: true`.
- **OnPush**: Always `changeDetection: ChangeDetectionStrategy.OnPush`.
- **Imports**: Explicitly import `CommonModule` and other dependencies.
- **Signals**: Use signals for state management within the component.
