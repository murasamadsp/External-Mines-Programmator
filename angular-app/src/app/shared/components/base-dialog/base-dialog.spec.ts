import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Component } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { BaseDialogComponent, DialogResult } from './base-dialog';

// Create a concrete test implementation of the abstract BaseDialogComponent
@Component({
  selector: 'app-test-dialog',
  standalone: true,
  template: `
    @if (visible()) {
      <div
        class="dialog-overlay"
        (click)="onOverlayClick($event)"
        (keydown)="onKeyDown($event)"
        tabindex="0"
        role="dialog"
      >
        <div class="dialog-content">
          <h2>{{ title }}</h2>
          <input [(ngModel)]="testValue" />
          <button type="button" (click)="submit()">Submit</button>
          <button type="button" (click)="cancel()">Cancel</button>
        </div>
      </div>
    }
  `,
})
class TestDialogComponent extends BaseDialogComponent<string> {
  title = 'Test Dialog';
  testValue = '';
  validationResult = true;

  protected validate(): boolean {
    return this.validationResult;
  }

  protected getValue(): string {
    return this.testValue;
  }
}

describe('BaseDialogComponent', () => {
  let component: TestDialogComponent;
  let fixture: ComponentFixture<TestDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should start with dialog closed', () => {
      expect(component.visible()).toBe(false);
    });

    it('should have a title', () => {
      expect(component.title).toBe('Test Dialog');
    });
  });

  describe('open/close lifecycle', () => {
    it('should open dialog and set visible to true', () => {
      component.open();
      expect(component.visible()).toBe(true);
    });

    it('should return a promise when opened', () => {
      const promise = component.open();
      expect(promise).toBeInstanceOf(Promise);
    });

    it('should close dialog and set visible to false', async () => {
      const promise = component.open();
      expect(component.visible()).toBe(true);

      component.close(null);
      expect(component.visible()).toBe(false);

      const result = await promise;
      expect(result).toBe(null);
    });

    it('should resolve promise with result on close', async () => {
      const promise = component.open();
      const expectedResult: DialogResult<string> = {
        confirmed: true,
        value: 'test',
      };

      component.close(expectedResult);

      const result = await promise;
      expect(result).toEqual(expectedResult);
    });
  });

  describe('submit', () => {
    it('should close with confirmed result when validation passes', async () => {
      component.testValue = 'hello';
      component.validationResult = true;

      const promise = component.open();
      component.submit();

      const result = await promise;
      expect(result).toEqual({
        confirmed: true,
        value: 'hello',
      });
    });

    it('should not close when validation fails', async () => {
      component.testValue = 'invalid';
      component.validationResult = false;

      const promise = component.open();
      component.submit();

      // Dialog should still be open
      expect(component.visible()).toBe(true);

      // Cleanup
      component.close(null);
      await promise;
    });
  });

  describe('cancel', () => {
    it('should close with null result', async () => {
      const promise = component.open();
      component.cancel();

      const result = await promise;
      expect(result).toBe(null);
      expect(component.visible()).toBe(false);
    });
  });

  describe('overlay click', () => {
    it('should close dialog when clicking overlay (event.target === event.currentTarget)', async () => {
      const promise = component.open();

      const target = document.createElement('div');
      const mockEvent = {
        target,
        currentTarget: target,
      } as MouseEvent;

      component.onOverlayClick(mockEvent);

      const result = await promise;
      expect(result).toBe(null);
      expect(component.visible()).toBe(false);
    });

    it('should not close dialog when clicking inside content', async () => {
      const promise = component.open();

      const overlay = document.createElement('div');
      const content = document.createElement('div');

      const mockEvent = {
        target: content,
        currentTarget: overlay,
      } as MouseEvent;

      component.onOverlayClick(mockEvent);

      // Dialog should still be open
      expect(component.visible()).toBe(true);

      // Cleanup
      component.close(null);
      await promise;
    });
  });

  describe('keyboard handlers', () => {
    it('should setup keyboard handler when dialog opens', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

      component.open();
      fixture.detectChanges();

      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      addEventListenerSpy.mockRestore();
    });

    it('should cleanup keyboard handler when dialog closes', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      component.open();
      component.close(null);
      fixture.detectChanges();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });

    it('should close dialog on Escape key', async () => {
      const promise = component.open();

      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      const preventDefaultSpy = vi.spyOn(escapeEvent, 'preventDefault');

      document.dispatchEvent(escapeEvent);

      const result = await promise;
      expect(result).toBe(null);
      expect(component.visible()).toBe(false);
      expect(preventDefaultSpy).toHaveBeenCalled();

      preventDefaultSpy.mockRestore();
    });

    it('should not close dialog on other keys', () => {
      component.open();

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      document.dispatchEvent(enterEvent);

      expect(component.visible()).toBe(true);

      // Cleanup
      component.close(null);
    });
  });

  describe('cleanup', () => {
    it('should cleanup keyboard handlers on destroy', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      component.open();
      fixture.detectChanges();

      fixture.destroy();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });

    it('should call cleanup() method when closing', () => {
      const cleanupSpy = vi.spyOn(component, 'cleanup' as keyof typeof component);

      component.open();
      component.close(null);

      expect(cleanupSpy).toHaveBeenCalled();

      cleanupSpy.mockRestore();
    });
  });

  describe('signal reactivity', () => {
    it('should update visible signal reactively', () => {
      expect(component.visible()).toBe(false);

      component.open();
      expect(component.visible()).toBe(true);

      component.close(null);
      expect(component.visible()).toBe(false);
    });
  });
});
