import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogService } from '../../../../core/services/dialog.service';
import { SerializerService } from '../../../../core/services/serializer.service';
import { ProgramService } from '../../../../core/services/program.service';

@Component({
  selector: 'app-decoder-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './decoder-dialog.html',
  styleUrls: ['./decoder-dialog.css'],
})
export class DecoderDialogComponent {
  isVisible = signal(false);
  programCode = signal('');
  resultMessage = signal('');
  resultType = signal<'success' | 'error' | 'info'>('info');

  private readonly dialogService = inject(DialogService);
  private readonly serializer = inject(SerializerService);
  private readonly programService = inject(ProgramService);

  open() {
    this.isVisible.set(true);
    this.programCode.set('');
    this.resultMessage.set('Введіть Base64 код програми для декодування');
    this.resultType.set('info');
  }

  close() {
    this.isVisible.set(false);
  }

  async decodeProgram() {
    const code = this.programCode().trim();

    if (!code) {
      this.resultMessage.set('❌ Будь ласка, введіть код програми');
      this.resultType.set('error');
      return;
    }

    try {
      const instructions = await this.serializer.decode(code);
      this.resultMessage.set(
        `✅ Програма декодована успішно! Знайдено ${instructions.length} інструкцій.`,
      );
      this.resultType.set('success');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Невідома помилка';
      this.resultMessage.set(`❌ Помилка декодування: ${errorMessage}`);
      this.resultType.set('error');
    }
  }

  async loadProgram() {
    const code = this.programCode().trim();

    if (!code) {
      this.resultMessage.set('❌ Будь ласка, введіть код програми');
      this.resultType.set('error');
      return;
    }

    try {
      await this.programService.loadProgram(code);
      this.resultMessage.set(`✅ Програму завантажено успішно!`);
      this.resultType.set('success');

      // Close dialog after short delay
      setTimeout(() => this.close(), 1500);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Невідома помилка';
      this.resultMessage.set(`❌ Помилка завантаження: ${errorMessage}`);
      this.resultType.set('error');
    }
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('dialog-backdrop')) {
      this.close();
    }
  }

  onEscapeKey(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.close();
    }
  }
}
