import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AutofocusDirective } from './autofocus.directive';

@Component({
  template: `<input [appAutofocus]="true" />`,
  standalone: true,
  imports: [AutofocusDirective],
})
class TestComponent {}

describe('AutofocusDirective', () => {
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestComponent],
    });

    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
  });

  it('should create an instance', () => {
    const directive = fixture.debugElement.query(By.directive(AutofocusDirective));
    expect(directive).toBeTruthy();
  });

  it('should focus the element when appAutofocus is true (default)', (done) => {
    const inputElement = fixture.nativeElement.querySelector('input');

    // Wait for setTimeout in directive
    setTimeout(() => {
      expect(document.activeElement).toBe(inputElement);
      done();
    }, 0);
  });
});
