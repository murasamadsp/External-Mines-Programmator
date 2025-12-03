import { Directive, ElementRef, Input, OnInit, inject } from '@angular/core';

@Directive({
  selector: '[appFocusTrap]',
  standalone: true,
})
export class FocusTrapDirective implements OnInit {
  @Input() appFocusTrap = '';

  private readonly el = inject(ElementRef);

  ngOnInit(): void {
    this.applyDirective();
  }

  private applyDirective(): void {
    const element = this.el.nativeElement as HTMLElement;

    // Add visual styling
    element.style.border = '2px solid #007bff';
    element.style.borderRadius = '4px';
    element.style.padding = '8px';
    element.style.backgroundColor = '#f8f9fa';

    // Add data attribute for identification
    element.setAttribute('data-focus-trap', this.appFocusTrap || 'active');

    // Add hover effect
    element.addEventListener('mouseenter', () => {
      element.style.backgroundColor = '#e9ecef';
      element.style.transform = 'scale(1.02)';
      element.style.transition = 'all 0.2s ease';
    });

    element.addEventListener('mouseleave', () => {
      element.style.backgroundColor = '#f8f9fa';
      element.style.transform = 'scale(1)';
    });

    console.log('FocusTrap directive applied to element');
  }
}
