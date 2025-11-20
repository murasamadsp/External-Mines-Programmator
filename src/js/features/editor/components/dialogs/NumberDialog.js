import { BaseDialog } from './BaseDialog.js';
import { Component } from '../../../../core/utils/Component.js';
import { createInput, createButton } from '../../../../core/utils/dom-utils.js';

export class NumberDialog extends BaseDialog {
  constructor(defaultValue = 0, min = 0, max = 9999) {
    super(`🔢 Enter Number (${min}-${max})`);
    this.defaultValue = defaultValue;
    this.min = min;
    this.max = max;
  }

  create() {
    super.create();

    const input = createInput({
      id: 'number-input',
      type: 'number',
      value: this.defaultValue.toString(),
      onKeyDown: (e) => {
        if (e.key === 'Enter') this.submit();
        if (e.key === 'Escape') this.close(null);
      }
    });

    const errorMsg = Component.create('div')
      .class('dialog-error')
      .style({ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem', minHeight: '1.25rem' })
      .render();

    const content = Component.create('div')
      .child(input)
      .child(errorMsg)
      .render();

    this.setContent(content);

    const footer = Component.create('div')
      .class('dialog-buttons')
      .style({ display: 'flex', justifyContent: 'flexEnd', gap: '0.5rem' })
      .child(
        createButton({
          id: 'cancel-btn',
          text: 'Cancel',
          className: 'btn-secondary',
          onClick: () => this.close(null)
        })
      )
      .child(
        createButton({
          id: 'submit-btn',
          text: 'Save',
          className: 'btn-primary',
          onClick: () => this.submit()
        })
      )
      .render();

    this.setFooter(footer);

    // NOTE: Autofocus removed due to buggy browser extension interference
    // User needs to click the input field manually
  }

  submit() {
    const input = this.dialog.querySelector('#number-input');
    const errorMsg = this.dialog.querySelector('.dialog-error');
    const val = parseInt(input.value);

    if (isNaN(val)) {
      errorMsg.textContent = "Not a valid number!";
      return;
    }

    if (val < this.min || val > this.max) {
      errorMsg.textContent = `Value must be between ${this.min} and ${this.max}`;
      return;
    }

    this.close(val);
  }
}
