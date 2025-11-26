// Діалог для введення двох лейблів (для порівняння змінних)
// Використовує кастомну реалізацію замість native prompt

import { BaseDialog } from "./BaseDialog.js";

export class TwoLabelsDialog extends BaseDialog {
  constructor(
    defaultLabel1 = "",
    defaultLabel2 = "",
    title = "Введіть імена змінних",
  ) {
    super();
    this.defaultLabel1 = defaultLabel1;
    this.defaultLabel2 = defaultLabel2;
    this.title = title;
  }

  createDialog() {
    // Основний контейнер діалогу
    const dialog = document.createElement("div");
    dialog.className = "dialog-overlay";

    const content = document.createElement("div");
    content.className = "dialog-content two-labels-dialog";

    // Заголовок
    const header = document.createElement("h3");
    header.textContent = this.title;
    header.className = "dialog-header";
    content.appendChild(header);

    // Форма з двома полями
    const form = document.createElement("form");
    form.className = "dialog-form";

    // Поле для першої змінної
    const label1Group = document.createElement("div");
    label1Group.className = "input-group";

    const label1Label = document.createElement("label");
    label1Label.textContent = "Перша змінна:";
    label1Label.className = "input-label";

    const label1Input = document.createElement("input");
    label1Input.type = "text";
    label1Input.className = "dialog-input";
    label1Input.placeholder = "Ім'я першої змінної";
    label1Input.value = this.defaultLabel1;
    label1Input.required = true;
    label1Input.maxLength = 1;

    label1Group.appendChild(label1Label);
    label1Group.appendChild(label1Input);

    // Поле для другої змінної
    const label2Group = document.createElement("div");
    label2Group.className = "input-group";

    const label2Label = document.createElement("label");
    label2Label.textContent = "Друга змінна:";
    label2Label.className = "input-label";

    const label2Input = document.createElement("input");
    label2Input.type = "text";
    label2Input.className = "dialog-input";
    label2Input.placeholder = "Ім'я другої змінної";
    label2Input.value = this.defaultLabel2;
    label2Input.required = true;
    label2Input.maxLength = 1;

    label2Group.appendChild(label2Label);
    label2Group.appendChild(label2Input);

    form.appendChild(label1Group);
    form.appendChild(label2Group);

    // Кнопки
    const buttonGroup = document.createElement("div");
    buttonGroup.className = "dialog-buttons";

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.textContent = "Скасувати";
    cancelButton.className = "dialog-button cancel";

    const submitButton = document.createElement("button");
    submitButton.type = "submit";
    submitButton.textContent = "OK";
    submitButton.className = "dialog-button submit";

    buttonGroup.appendChild(cancelButton);
    buttonGroup.appendChild(submitButton);

    form.appendChild(buttonGroup);

    // Обробники подій
    form.addEventListener("submit", e => {
      e.preventDefault();
      const result = {
        label1: label1Input.value.trim(),
        label2: label2Input.value.trim(),
      };
      this.resolve(result);
    });

    cancelButton.addEventListener("click", () => {
      this.resolve(null);
    });

    // Автофокус на першому полі
    setTimeout(() => label1Input.focus(), 100);

    content.appendChild(form);
    dialog.appendChild(content);

    return dialog;
  }
}
