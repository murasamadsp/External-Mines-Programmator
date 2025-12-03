import { Directive, ElementRef, Input, OnChanges, Renderer2, inject } from '@angular/core';

@Directive({
  selector: '[appLoading]',
  standalone: true,
})
export class LoadingDirective implements OnChanges {
  @Input() appLoading = false;
  @Input() loadingText = 'Loading...';

  private loadingElement: HTMLElement | null = null;

  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  ngOnChanges(): void {
    if (this.appLoading) {
      this.showLoading();
    } else {
      this.hideLoading();
    }
  }

  private showLoading(): void {
    const element = this.el.nativeElement;

    // Create loading overlay
    this.loadingElement = this.renderer.createElement('div');
    this.renderer.setStyle(this.loadingElement, 'position', 'relative');
    this.renderer.setStyle(this.loadingElement, 'display', 'inline-block');

    // Create spinner
    const spinner = this.renderer.createElement('div');
    this.renderer.addClass(spinner, 'loading-spinner');

    // Create text
    const text = this.renderer.createText(this.loadingText);

    // Add to DOM
    this.renderer.appendChild(this.loadingElement, spinner);
    this.renderer.appendChild(this.loadingElement, text);
    this.renderer.insertBefore(element.parentNode, this.loadingElement, element);
    this.renderer.setStyle(element, 'display', 'none');
  }

  private hideLoading(): void {
    if (this.loadingElement) {
      this.renderer.removeChild(this.loadingElement.parentNode, this.loadingElement);
      this.loadingElement = null;
      this.renderer.setStyle(this.el.nativeElement, 'display', '');
    }
  }
}
