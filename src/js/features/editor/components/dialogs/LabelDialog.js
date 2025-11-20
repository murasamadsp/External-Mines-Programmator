import { BaseDialog } from './BaseDialog.js';
import { Component } from '../../../../core/utils/Component.js';
import { createInput, createButton } from '../../../../core/utils/dom-utils.js';

export class LabelDialog extends BaseDialog {
  constructor(defaultValue = "") {
    super("🏷️ Enter Label");
    this.defaultValue = defaultValue;
  }

  create() {
    super.create();

    const input = createInput({
      id: 'label-input',
      value: this.defaultValue,
      placeholder: 'Enter label name...',
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
      .child(
        Component.create('p')
          .style({ marginBottom: '0.5rem', color: '#9ca3af' })
          .text('Only letters, numbers, and underscores allowed.')
      )
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
    const input = this.dialog.querySelector('#label-input');
    const errorMsg = this.dialog.querySelector('.dialog-error');
    const val = input.value.trim();

    if (!val) {
      errorMsg.textContent = "Label cannot be empty!";
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(val)) {
      errorMsg.textContent = "Invalid characters! Only letters, numbers, and underscores.";
      return;
    }

    this.close(val);
  }
}
