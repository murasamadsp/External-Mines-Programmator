import { ProgAction } from "../constants/actions.js";

/**
 * Клас інструкції, що представляє одну інструкцію програми
 * Заснований на структурі C# Instruction: (ProgAction action, string? label, int? value)
 */
export class Instruction {
  /**
   * @param {number} action - Значення enum ProgAction
   * @param {string|null} label - Мітка для переходів/викликів (опціонально)
   * @param {number|null} value - Значення для операцій зі змінними (опціонально)
   */
  constructor(action, label = null, value = null) {
    this.action = action;
    this.label = label;
    this.value = value;
  }
}



