import {
  Injectable,
  ComponentRef,
  ApplicationRef,
  createComponent,
  EnvironmentInjector,
  EmbeddedViewRef,
  Type,
  OnDestroy,
  inject,
} from '@angular/core';
import { NumberDialogComponent } from '../../shared/components/number-dialog/number-dialog';
import { LabelDialogComponent } from '../../shared/components/label-dialog/label-dialog';
import {
  CoordinatesDialogComponent,
  CoordinatesValue,
} from '../../shared/components/coordinates-dialog/coordinates-dialog';
import {
  TwoLabelsDialogComponent,
  TwoLabelsValue,
} from '../../shared/components/two-labels-dialog/two-labels-dialog';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog';
import { InfoDialogComponent } from '../../shared/components/info-dialog/info-dialog';

@Injectable({
  providedIn: 'root',
})
export class DialogService implements OnDestroy {
  private dialogRefs: ComponentRef<unknown>[] = [];

  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(EnvironmentInjector);

  /**
   * Prompt for a text label
   */
  async promptForLabel(defaultValue = ''): Promise<string | null> {
    const dialogRef = this.createDialog(LabelDialogComponent);
    const result = await dialogRef.instance.openWithParams(defaultValue);
    this.destroyDialog(dialogRef);

    return result?.confirmed && result.value !== undefined ? result.value : null;
  }

  /**
   * Prompt for a number with min/max validation
   */
  async promptForNumber(defaultValue = 0, min = 0, max = 9999): Promise<number | null> {
    const dialogRef = this.createDialog(NumberDialogComponent);
    const result = await dialogRef.instance.openWithParams(defaultValue, min, max);
    this.destroyDialog(dialogRef);

    return result?.confirmed && result.value !== undefined ? result.value : null;
  }

  /**
   * Prompt for X/Y coordinates
   */
  async promptForCoordinates(defaultX = 0, defaultY = 0): Promise<CoordinatesValue | null> {
    const dialogRef = this.createDialog(CoordinatesDialogComponent);
    const result = await dialogRef.instance.openWithParams(defaultX, defaultY);
    this.destroyDialog(dialogRef);

    return result?.confirmed && result.value !== undefined ? result.value : null;
  }

  /**
   * Prompt for two labels (for variable comparison)
   */
  async promptForTwoLabels(
    defaultLabel1 = '',
    defaultLabel2 = '',
    title = 'Введіть імена змінних',
  ): Promise<TwoLabelsValue | null> {
    const dialogRef = this.createDialog(TwoLabelsDialogComponent);
    const result = await dialogRef.instance.openWithParams(defaultLabel1, defaultLabel2, title);
    this.destroyDialog(dialogRef);

    return result?.confirmed && result.value !== undefined ? result.value : null;
  }

  /**
   * Show a confirmation dialog (Yes/No)
   */
  async showConfirmDialog(message: string, title = 'Confirm'): Promise<boolean> {
    const dialogRef = this.createDialog(ConfirmDialogComponent);
    const result = await dialogRef.instance.openWithParams(message, title);
    this.destroyDialog(dialogRef);

    return result?.confirmed || false;
  }

  /**
   * Show an information dialog (OK button only)
   */
  async showInfoDialog(message: string, title = 'Info'): Promise<void> {
    const dialogRef = this.createDialog(InfoDialogComponent);
    await dialogRef.instance.openWithParams(message, title);
    this.destroyDialog(dialogRef);
  }

  /**
   * Creates a dialog component dynamically and attaches it to the DOM
   */
  private createDialog<T>(componentType: Type<T>): ComponentRef<T> {
    const componentRef = createComponent(componentType, {
      environmentInjector: this.injector,
    });

    // Attach to application
    this.appRef.attachView(componentRef.hostView);

    // Append to body
    const domElem = (componentRef.hostView as EmbeddedViewRef<unknown>).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);

    // Track the dialog ref
    this.dialogRefs.push(componentRef as ComponentRef<unknown>);

    return componentRef;
  }

  /**
   * Destroys a dialog component and removes it from the DOM
   */
  private destroyDialog(dialogRef: ComponentRef<unknown>): void {
    const index = this.dialogRefs.indexOf(dialogRef);
    if (index > -1) {
      this.dialogRefs.splice(index, 1);
    }

    this.appRef.detachView(dialogRef.hostView);
    dialogRef.destroy();
  }

  /**
   * Cleanup all open dialogs
   */
  ngOnDestroy(): void {
    this.dialogRefs.forEach((ref) => {
      this.appRef.detachView(ref.hostView);
      ref.destroy();
    });
    this.dialogRefs = [];
  }
}
