---
name: angular-form
description: Generates Angular reactive forms with validation, error handling, and state management
---

# Angular Reactive Form Generator

This skill helps you generate Angular reactive forms with proper validation, error handling, and state management following Angular best practices.

## Basic Reactive Form Template

```typescript
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

interface UserForm {
  name: string;
  email: string;
  age: number;
}

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
      <div class="form-group">
        <label for="name">Name</label>
        <input
          id="name"
          type="text"
          formControlName="name"
          [class.error]="isFieldInvalid('name')"
        />
        @if (isFieldInvalid('name')) {
          <div class="error-message">{{ getFieldError('name') }}</div>
        }
      </div>

      <div class="form-group">
        <label for="email">Email</label>
        <input
          id="email"
          type="email"
          formControlName="email"
          [class.error]="isFieldInvalid('email')"
        />
        @if (isFieldInvalid('email')) {
          <div class="error-message">{{ getFieldError('email') }}</div>
        }
      </div>

      <div class="form-group">
        <label for="age">Age</label>
        <input id="age" type="number" formControlName="age" [class.error]="isFieldInvalid('age')" />
        @if (isFieldInvalid('age')) {
          <div class="error-message">{{ getFieldError('age') }}</div>
        }
      </div>

      <button type="submit" [disabled]="userForm.invalid || isSubmitting()">
        {{ isSubmitting() ? 'Submitting...' : 'Submit' }}
      </button>
    </form>
  `,
  styles: [
    `
      .form-group {
        margin-bottom: 1rem;
      }

      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
      }

      input {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
      }

      input.error {
        border-color: #dc3545;
      }

      .error-message {
        color: #dc3545;
        font-size: 0.875rem;
        margin-top: 0.25rem;
      }

      button {
        padding: 0.75rem 1.5rem;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }

      button:disabled {
        background: #6c757d;
        cursor: not-allowed;
      }
    `,
  ],
})
export class UserFormComponent {
  private readonly fb = inject(FormBuilder);

  userForm: FormGroup;
  isSubmitting = signal(false);

  constructor() {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      age: [18, [Validators.required, Validators.min(18), Validators.max(120)]],
    });
  }

  isFieldInvalid(fieldName: keyof UserForm): boolean {
    const control = this.userForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getFieldError(fieldName: keyof UserForm): string {
    const control = this.userForm.get(fieldName);
    if (!control || !control.errors) return '';

    if (control.errors['required']) return 'This field is required';
    if (control.errors['email']) return 'Please enter a valid email address';
    if (control.errors['minlength'])
      return `Minimum length is ${control.errors['minlength'].requiredLength} characters`;
    if (control.errors['min']) return `Minimum value is ${control.errors['min'].min}`;
    if (control.errors['max']) return `Maximum value is ${control.errors['max'].max}`;

    return 'Invalid value';
  }

  async onSubmit() {
    if (this.userForm.valid) {
      this.isSubmitting.set(true);

      try {
        const formValue: UserForm = this.userForm.value;
        console.log('Form submitted:', formValue);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Reset form on success
        this.userForm.reset();
        alert('Form submitted successfully!');
      } catch (error) {
        console.error('Form submission error:', error);
        alert('An error occurred while submitting the form');
      } finally {
        this.isSubmitting.set(false);
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.userForm.controls).forEach((key) => {
        this.userForm.get(key)?.markAsTouched();
      });
    }
  }
}
```

## Advanced Form Patterns

### Dynamic Form with FormArray

```typescript
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
}

interface UserProfileForm {
  firstName: string;
  lastName: string;
  skills: Skill[];
}

@Component({
  selector: 'app-user-profile-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
      <div class="form-row">
        <div class="form-group">
          <label>First Name</label>
          <input type="text" formControlName="firstName" />
        </div>

        <div class="form-group">
          <label>Last Name</label>
          <input type="text" formControlName="lastName" />
        </div>
      </div>

      <div class="skills-section">
        <h3>Skills</h3>

        <div formArrayName="skills">
          @for (skill of skills.controls; track $index) {
            <div [formGroupName]="$index" class="skill-item">
              <input type="text" formControlName="name" placeholder="Skill name" />
              <select formControlName="level">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <button type="button" (click)="removeSkill($index)">Remove</button>
            </div>
          }
        </div>

        <button type="button" (click)="addSkill()">Add Skill</button>
      </div>

      <button type="submit" [disabled]="profileForm.invalid">Save Profile</button>
    </form>
  `,
})
export class UserProfileFormComponent {
  private readonly fb = inject(FormBuilder);

  profileForm: FormGroup;

  constructor() {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      skills: this.fb.array([]),
    });
  }

  get skills(): FormArray {
    return this.profileForm.get('skills') as FormArray;
  }

  createSkill(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      level: ['beginner', Validators.required],
    });
  }

  addSkill() {
    this.skills.push(this.createSkill());
  }

  removeSkill(index: number) {
    this.skills.removeAt(index);
  }

  onSubmit() {
    if (this.profileForm.valid) {
      const formValue: UserProfileForm = this.profileForm.value;
      console.log('Profile saved:', formValue);
    }
  }
}
```

### Custom Validators

```typescript
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Password strength validator
export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) return null;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecial = /[#?!@$%^&*-]/.test(value);
    const isLongEnough = value.length >= 8;

    const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecial && isLongEnough;

    return !passwordValid
      ? {
          passwordStrength: {
            hasUpperCase,
            hasLowerCase,
            hasNumeric,
            hasSpecial,
            isLongEnough,
          },
        }
      : null;
  };
}

// Confirm password validator
export function confirmPasswordValidator(passwordControlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.parent) return null;

    const password = control.parent.get(passwordControlName);
    const confirmPassword = control;

    if (!password || !confirmPassword) return null;

    return password.value !== confirmPassword.value ? { confirmPassword: true } : null;
  };
}

// Async validator example
export function uniqueEmailValidator(userService: UserService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    return control.valueChanges.pipe(
      debounceTime(300),
      take(1),
      switchMap((email) => userService.checkEmailExists(email)),
      map((exists) => (exists ? { emailExists: true } : null)),
      catchError(() => of(null)),
    );
  };
}
```

### Form State Management Service

```typescript
import { Injectable, signal, computed } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

export interface FormState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class FormService {
  private readonly fb = inject(FormBuilder);

  // Generic form state management
  createFormState<T>(initialData?: Partial<T>) {
    return {
      form: signal<FormGroup | null>(null),
      state: signal<FormState<T>>({
        data: initialData || null,
        loading: false,
        error: null,
        success: false,
      }),
      isDirty: computed(() => this.form()?.dirty ?? false),
      isValid: computed(() => this.form()?.valid ?? false),
      hasErrors: computed(() => this.form()?.invalid ?? false),
    };
  }

  // Utility methods for form handling
  markFormGroupTouched(form: FormGroup) {
    Object.keys(form.controls).forEach((key) => {
      const control = form.get(key);
      control?.markAsTouched();
    });
  }

  getFormErrors(form: FormGroup): Record<string, string[]> {
    const errors: Record<string, string[]> = {};

    Object.keys(form.controls).forEach((key) => {
      const control = form.get(key);
      if (control?.errors) {
        errors[key] = Object.keys(control.errors);
      }
    });

    return errors;
  }

  resetForm(form: FormGroup, initialValue?: any) {
    form.reset(initialValue);
    form.markAsPristine();
    form.markAsUntouched();
  }
}
```

### Advanced Form Component with Signals

```typescript
import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-advanced-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="form-container">
      <form [formGroup]="contactForm" (ngSubmit)="onSubmit()">
        <!-- Form fields -->

        <div class="form-actions">
          <button type="button" (click)="reset()" [disabled]="!isDirty()">Reset</button>
          <button type="submit" [disabled]="!isValid() || isSubmitting()">
            {{ isSubmitting() ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </form>

      <!-- Form status -->
      <div class="form-status" *ngIf="formStatus()">
        <div [ngClass]="formStatus()?.type" class="status-message">
          {{ formStatus()?.message }}
        </div>
      </div>
    </div>
  `,
})
export class AdvancedFormComponent {
  private readonly fb = inject(FormBuilder);

  contactForm: FormGroup;
  isSubmitting = signal(false);

  // Computed signals for form state
  isDirty = computed(() => this.contactForm?.dirty ?? false);
  isValid = computed(() => this.contactForm?.valid ?? false);
  formStatus = signal<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  constructor() {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.maxLength(500)]],
    });

    // Watch form changes
    effect(() => {
      if (this.isDirty()) {
        this.formStatus.set({ type: 'info', message: 'You have unsaved changes' });
      }
    });
  }

  async onSubmit() {
    if (this.contactForm.valid) {
      this.isSubmitting.set(true);
      this.formStatus.set(null);

      try {
        const formData = this.contactForm.value;
        // Submit logic here

        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

        this.formStatus.set({ type: 'success', message: 'Form submitted successfully!' });
        this.contactForm.reset();
      } catch (error) {
        this.formStatus.set({ type: 'error', message: 'Failed to submit form. Please try again.' });
      } finally {
        this.isSubmitting.set(false);
      }
    }
  }

  reset() {
    this.contactForm.reset();
    this.formStatus.set(null);
  }
}
```

## Form Testing Patterns

```typescript
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { UserFormComponent } from './user-form.component';

describe('UserFormComponent', () => {
  let component: UserFormComponent;
  let fixture: ComponentFixture<UserFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserFormComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(UserFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form when empty', () => {
    expect(component.userForm.valid).toBeFalsy();
  });

  it('should validate required fields', () => {
    const nameControl = component.userForm.get('name');
    nameControl?.setValue('');
    expect(nameControl?.valid).toBeFalsy();
    expect(component.isFieldInvalid('name')).toBeTruthy();
  });

  it('should validate email format', () => {
    const emailControl = component.userForm.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.valid).toBeFalsy();
    expect(component.getFieldError('email')).toContain('valid email');
  });

  it('should submit form when valid', fakeAsync(() => {
    spyOn(window, 'alert');

    component.userForm.setValue({
      name: 'John Doe',
      email: 'john@example.com',
      age: 25,
    });

    component.onSubmit();
    tick(1000); // Wait for async operation

    expect(window.alert).toHaveBeenCalledWith('Form submitted successfully!');
  }));
});
```

## Key Principles

- **Reactive Forms**: Use reactive forms for complex validation and dynamic behavior
- **Type Safety**: Define interfaces for form data structures
- **Validation**: Implement both synchronous and asynchronous validators
- **User Experience**: Provide clear error messages and loading states
- **Accessibility**: Ensure forms are keyboard accessible and screen reader friendly
- **Performance**: Use signals for reactive form state management
- **Testing**: Test form validation, submission, and error handling
- **Progressive Enhancement**: Forms should work without JavaScript

## Integration with Universal Skills

This form skill integrates with other Universal Skills:

- **angular-service**: Form state management services
- **angular-component**: Reusable form components
- **angular-directive**: Custom form directives and validators
- **angular-animation**: Form transition animations
- **angular-testing**: Comprehensive form testing patterns

Reactive forms provide robust, scalable form handling with excellent developer experience and user interactions! 📝✨
