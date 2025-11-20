import { BaseDialog } from './BaseDialog.js';
import { Component } from '../../../../core/utils/Component.js';
import { createButton } from '../../../../core/utils/dom-utils.js';

export class ConfirmDialog extends BaseDialog {
  constructor(message, title = "Confirm") {
    super(title);
    this.message = message;
  }

  create() {
    super.create();

    const content = Component.create('div')
      .style({ padding: '0.5rem 0' })
      .text(this.message)
      .render();
      
    this.setContent(content);

    const footer = Component.create('div')
      .class('dialog-buttons')
      .style({ display: 'flex', justifyContent: 'flexEnd', gap: '0.5rem' })
      .child(
        createButton({
          id: 'cancel-btn',
          text: 'No',
          className: 'btn-secondary',
          onClick: () => this.close(false)
        })
      )
      .child(
        createButton({
          id: 'confirm-btn',
          text: 'Yes',
          className: 'btn-primary',
          onClick: () => this.close(true)
        })
      )
      .render();

    this.setFooter(footer);
  }
}
