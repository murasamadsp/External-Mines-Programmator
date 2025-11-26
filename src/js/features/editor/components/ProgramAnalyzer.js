/**
 * ProgramAnalyzer - аналізатор програм Mines
 * Надає статистику та аналітику програм для оптимізації
 */
import { Component } from "../../../core/utils/Component.js";
import { ProgAction } from "../../../core/constants/actions.js";
import { loggers } from "../../../utils/logging/logger.js";

export class ProgramAnalyzer {
  constructor() {
    this.logger = loggers.core.child("ProgramAnalyzer");
  }

  /**
   * Створює UI компонент аналізатора програм
   * @returns {HTMLElement} DOM елемент інтерфейсу
   */
  createUI() {
    const container = Component.create("div")
      .class("program-analyzer")
      .render();

    const title = Component.create("h3").text("📊 Аналізатор програм").render();

    const description = Component.create("p")
      .class("analyzer-description")
      .text(
        "Аналізуйте вашу програму для отримання статистики та рекомендацій з оптимізації",
      )
      .render();

    const statsSection = Component.create("div")
      .class("stats-section")
      .render();

    const statsTitle = Component.create("h4")
      .text("Статистика програм")
      .render();

    const statsGrid = Component.create("div").class("stats-grid").render();

    // Створюємо елементи статистики
    const stats = [
      {
        id: "total-instructions",
        label: "Загальна кількість інструкцій",
        value: "0",
      },
      { id: "unique-actions", label: "Унікальних дій", value: "0" },
      { id: "movement-actions", label: "Дій руху", value: "0" },
      { id: "logic-actions", label: "Логічних операцій", value: "0" },
      { id: "condition-actions", label: "Умовних перевірок", value: "0" },
      {
        id: "labeled-instructions",
        label: "Міткованих інструкцій",
        value: "0",
      },
    ];

    stats.forEach(stat => {
      const statItem = Component.create("div").class("stat-item").render();

      const label = Component.create("div")
        .class("stat-label")
        .text(stat.label)
        .render();

      const value = Component.create("div")
        .class("stat-value")
        .id(stat.id)
        .text(stat.value)
        .render();

      statItem.appendChild(label);
      statItem.appendChild(value);
      statsGrid.appendChild(statItem);
    });

    const recommendationsSection = Component.create("div")
      .class("recommendations-section")
      .render();

    const recTitle = Component.create("h4")
      .text("Рекомендації з оптимізації")
      .render();

    const recommendations = Component.create("div")
      .id("program-recommendations")
      .class("program-recommendations")
      .text("Завантажте програму для отримання рекомендацій...")
      .render();

    // Додаємо елементи до контейнерів
    statsSection.appendChild(statsTitle);
    statsSection.appendChild(statsGrid);

    recommendationsSection.appendChild(recTitle);
    recommendationsSection.appendChild(recommendations);

    container.appendChild(title);
    container.appendChild(description);
    container.appendChild(statsSection);
    container.appendChild(recommendationsSection);

    return container;
  }

  /**
   * Аналізує програму та оновлює статистику
   * @param {Array} instructions - Масив інструкцій програми
   */
  analyzeProgram(instructions) {
    if (!instructions || instructions.length === 0) {
      this.showEmptyAnalysis();
      return;
    }

    const stats = this.calculateStats(instructions);
    const recommendations = this.generateRecommendations(stats, instructions);

    this.updateStatsDisplay(stats);
    this.updateRecommendationsDisplay(recommendations);

    this.logger.info("Аналіз програми завершено", {
      stats,
      recommendationsCount: recommendations.length,
    });
  }

  /**
   * Розраховує статистику програми
   * @param {Array} instructions - Масив інструкцій
   * @returns {Object} Статистика програми
   */
  calculateStats(instructions) {
    const stats = {
      totalInstructions: instructions.length,
      uniqueActions: new Set(),
      movementActions: 0,
      logicActions: 0,
      conditionActions: 0,
      labeledInstructions: 0,
      actionCounts: new Map(),
    };

    // Категорії дій
    const movementActions = new Set([
      ProgAction.MoveUp,
      ProgAction.MoveLeft,
      ProgAction.MoveDown,
      ProgAction.MoveRight,
      ProgAction.MoveForward,
      ProgAction.RotateUp,
      ProgAction.RotateLeft,
      ProgAction.RotateDown,
      ProgAction.RotateRight,
      ProgAction.RotateLefthand,
      ProgAction.RotateRighthand,
      ProgAction.RotateRandom,
    ]);

    const logicActions = new Set([ProgAction.BooleanOR, ProgAction.BooleanAND]);

    const conditionActions = new Set([
      ProgAction.IsNotEmpty,
      ProgAction.IsEmpty,
      ProgAction.IsFalling,
      ProgAction.IsCrystal,
      ProgAction.IsBreakable,
      ProgAction.IsUnbreakable,
      ProgAction.IsRedRock,
      ProgAction.IsBlackRock,
      ProgAction.IsSand,
      ProgAction.IsQuadro,
      ProgAction.IsRoad,
      ProgAction.IsRedBlock,
      ProgAction.IsYellowBlock,
      ProgAction.IsGreenBlock,
      ProgAction.IsBasketFull,
      ProgAction.IsGeoFull,
      ProgAction.IsHealthNotFull,
      ProgAction.IsHealthLessThanHalf,
    ]);

    instructions.forEach(instruction => {
      if (!instruction) return;

      // Підраховуємо унікальні дії
      stats.uniqueActions.add(instruction.action);

      // Підраховуємо за категоріями
      if (movementActions.has(instruction.action)) {
        stats.movementActions++;
      }
      if (logicActions.has(instruction.action)) {
        stats.logicActions++;
      }
      if (conditionActions.has(instruction.action)) {
        stats.conditionActions++;
      }

      // Підраховуємо мітковані інструкції
      if (instruction.label) {
        stats.labeledInstructions++;
      }

      // Підраховуємо кількість кожного типу дії
      const count = stats.actionCounts.get(instruction.action) || 0;
      stats.actionCounts.set(instruction.action, count + 1);
    });

    stats.uniqueActionsCount = stats.uniqueActions.size;

    return stats;
  }

  /**
   * Генерує рекомендації з оптимізації
   * @param {Object} stats - Статистика програми
   * @param {Array} instructions - Масив інструкцій
   * @returns {Array} Масив рекомендацій
   */
  generateRecommendations(stats, instructions) {
    const recommendations = [];

    // Рекомендація про розмір програми
    if (stats.totalInstructions > 1000) {
      recommendations.push({
        type: "warning",
        message:
          "Програма дуже велика (>1000 інструкцій). Розгляньте можливість оптимізації або розділення на менші програми.",
      });
    }

    // Рекомендація про різноманітність дій
    if (stats.uniqueActionsCount < 3) {
      recommendations.push({
        type: "info",
        message:
          "Програма використовує мало різноманітних дій. Можливо, її можна спростити або додати більше функціональності.",
      });
    }

    // Рекомендація про умови
    const conditionRatio = stats.conditionActions / stats.totalInstructions;
    if (conditionRatio > 0.5) {
      recommendations.push({
        type: "warning",
        message:
          "Програма містить багато умовних перевірок (>50%). Це може уповільнити виконання.",
      });
    }

    // Рекомендація про мітки
    if (stats.labeledInstructions === 0) {
      recommendations.push({
        type: "info",
        message:
          "Програма не використовує мітки. Додавання Goto/Call інструкцій може покращити контроль потоку.",
      });
    }

    // Рекомендація про повторювані дії
    const mostUsedAction = Array.from(stats.actionCounts.entries()).sort(
      (a, b) => b[1] - a[1],
    )[0];

    if (mostUsedAction && mostUsedAction[1] > stats.totalInstructions * 0.3) {
      recommendations.push({
        type: "info",
        message: `Дія "${mostUsedAction[0]}" використовується дуже часто (${mostUsedAction[1]} разів). Можливо, варто використати RepeatLastAction.`,
      });
    }

    // Рекомендація про логіку
    if (stats.logicActions === 0 && stats.conditionActions > 2) {
      recommendations.push({
        type: "info",
        message:
          "Програма має умови, але не використовує логічні операції (AND/OR). Це може покращити логіку прийняття рішень.",
      });
    }

    return recommendations;
  }

  /**
   * Оновлює відображення статистики
   * @param {Object} stats - Статистика для відображення
   */
  updateStatsDisplay(stats) {
    this.setStatValue("total-instructions", stats.totalInstructions);
    this.setStatValue("unique-actions", stats.uniqueActionsCount);
    this.setStatValue("movement-actions", stats.movementActions);
    this.setStatValue("logic-actions", stats.logicActions);
    this.setStatValue("condition-actions", stats.conditionActions);
    this.setStatValue("labeled-instructions", stats.labeledInstructions);
  }

  /**
   * Оновлює відображення рекомендацій
   * @param {Array} recommendations - Масив рекомендацій
   */
  updateRecommendationsDisplay(recommendations) {
    const container = document.getElementById("program-recommendations");
    if (!container) return;

    container.innerHTML = "";

    if (recommendations.length === 0) {
      container.textContent =
        "✅ Програма оптимальна! Жодних рекомендацій з покращення.";
      container.className = "program-recommendations success";
      return;
    }

    recommendations.forEach(rec => {
      const recElement = Component.create("div")
        .class(`recommendation ${rec.type}`)
        .text(`${this.getRecommendationIcon(rec.type)} ${rec.message}`)
        .render();

      container.appendChild(recElement);
    });

    container.className = "program-recommendations";
  }

  /**
   * Відображає порожній аналіз
   */
  showEmptyAnalysis() {
    this.updateStatsDisplay({
      totalInstructions: 0,
      uniqueActionsCount: 0,
      movementActions: 0,
      logicActions: 0,
      conditionActions: 0,
      labeledInstructions: 0,
    });

    const container = document.getElementById("program-recommendations");
    if (container) {
      container.textContent = "Завантажте програму для аналізу...";
      container.className = "program-recommendations";
    }
  }

  /**
   * Встановлює значення статистики
   * @param {string} id - ID елемента статистики
   * @param {number} value - Значення для відображення
   */
  setStatValue(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  }

  /**
   * Повертає іконку для типу рекомендації
   * @param {string} type - Тип рекомендації
   * @returns {string} Іконка
   */
  getRecommendationIcon(type) {
    switch (type) {
      case "warning":
        return "⚠️";
      case "error":
        return "❌";
      case "success":
        return "✅";
      case "info":
      default:
        return "ℹ️";
    }
  }
}
