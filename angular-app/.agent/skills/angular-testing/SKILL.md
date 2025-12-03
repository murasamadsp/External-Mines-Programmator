---
name: angular-testing
description: Generates Angular tests using Vitest and Testing Library
---

# Angular Testing Skill

This skill helps you create focused, effective tests for Angular components and services using Vitest.

## Service Testing Template

```typescript
import { TestBed } from '@angular/core/testing';
import { {{Name}}Service } from './{{name}}.service';

describe('{{Name}}Service', () => {
  let service: {{Name}}Service;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{{Name}}Service]
    });
    service = TestBed.inject({{Name}}Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should handle state correctly', () => {
    // Arrange
    const testData = { /* test data */ };

    // Act
    service.updateState(testData);

    // Assert
    expect(service.state()).toEqual(testData);
  });
});
```

## Real Example: Settings Service Test

```typescript
import { TestBed } from '@angular/core/testing';
import { SettingsService } from './settings.service';
import { SettingsStorageUtil } from '../utils/storage.util';

// Mock the storage utility
jest.mock('../utils/storage.util');

describe('SettingsService', () => {
  let service: SettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SettingsService]
    });
    service = TestBed.inject(SettingsService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get setting value', () => {
    const mockSettings = { theme: 'dark' };
    (SettingsStorageUtil.getAll as jest.Mock).mockReturnValue(mockSettings);
    (SettingsStorageUtil.get as jest.Mock).mockReturnValue('dark');

    const result = service.get('theme', 'light');
    expect(result).toBe('dark');
    expect(SettingsStorageUtil.get).toHaveBeenCalledWith('theme', 'light');
  });

  it('should set setting value', () => {
    (SettingsStorageUtil.set as jest.Mock).mockReturnValue(true);

    const result = service.set('theme', 'dark');
    expect(result).toBe(true');
    expect(SettingsStorageUtil.set).toHaveBeenCalledWith('theme', 'dark');
  });

  it('should handle signal updates', () => {
    (SettingsStorageUtil.set as jest.Mock).mockReturnValue(true);
    (SettingsStorageUtil.getAll as jest.Mock).mockReturnValue({ theme: 'dark' });

    service.set('theme', 'dark');

    // Test that signals are updated
    expect(service.settings()).toEqual({ theme: 'dark' });
  });
});
```

## Component Testing Template

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { {{Name}}Component } from './{{name}}.component';

describe('{{Name}}Component', () => {
  let component: {{Name}}Component;
  let fixture: ComponentFixture<{{Name}}Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [{{Name}}Component] // Standalone component
    }).compileComponents();

    fixture = TestBed.createComponent({{Name}}Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle user interaction', () => {
    // Test business logic, not DOM manipulation
    component.onAction();
    expect(component.state()).toBe(expectedState);
  });
});
```

## Principles

- **AAA Pattern**: Arrange, Act, Assert
- **Test Behavior**: Not implementation details
- **Mock Dependencies**: Isolate the unit under test
- **Descriptive Names**: Test name should explain the scenario
- **One Assertion Focus**: Each test should verify one thing
