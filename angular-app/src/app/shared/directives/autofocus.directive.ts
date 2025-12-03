import { Directive, ElementRef, Input, OnInit, inject } from '@angular/core';

@Directive({
  selector: '[appAutofocus]',
  standalone: true,
})
export class AutofocusDirective implements OnInit {
  @Input() appAutofocus = true;

  private readonly el = inject(ElementRef);

  ngOnInit(): void {
    if (this.appAutofocus) {
      setTimeout(() => {
        this.el.nativeElement.focus();
      });
    }
  }
}
