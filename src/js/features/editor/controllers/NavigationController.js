// NavigationController - відповідає за навігацію по сторінках
// Принцип єдиної відповідальності: тільки навігація та керування сторінками

import { MAX_PAGES } from "../../../core/constants/grid.js";
import { loggers } from "../../../utils/logging/logger.js";

export class NavigationController {
  constructor(program, uiController) {
    this.program = program;
    this.uiController = uiController;
    this.currentPage = 0;
  }

  /**
   * Перемикається на попередню сторінку
   */
  switchToPrevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.uiController.setGridCurrentPage(this.currentPage);
      this.uiController.updatePageDisplay(this.currentPage, MAX_PAGES);
      this.uiController.updateGridDisplay();
      loggers.editor.info(`📄 Переключено на сторінку ${this.currentPage}`);
    }
  }

  /**
   * Перемикається на наступну сторінку
   */
  switchToNextPage() {
    if (this.currentPage < MAX_PAGES - 1) {
      this.currentPage++;
      this.uiController.setGridCurrentPage(this.currentPage);
      this.uiController.updatePageDisplay(this.currentPage, MAX_PAGES);
      this.uiController.updateGridDisplay();
      loggers.editor.info(`📄 Переключено на сторінку ${this.currentPage}`);
    }
  }

  /**
   * Перемикається на конкретну сторінку
   * @param pageNumber
   */
  switchToPage(pageNumber) {
    if (
      pageNumber >= 0 &&
      pageNumber < MAX_PAGES &&
      pageNumber !== this.currentPage
    ) {
      this.currentPage = pageNumber;
      this.uiController.setGridCurrentPage(this.currentPage);
      this.uiController.updatePageDisplay(this.currentPage, MAX_PAGES);
      this.uiController.updateGridDisplay();
      loggers.editor.info(`📄 Переключено на сторінку ${this.currentPage}`);
    }
  }

  /**
   * Отримує поточну сторінку
   */
  getCurrentPage() {
    return this.currentPage;
  }

  /**
   * Отримує загальну кількість сторінок
   */
  getMaxPages() {
    return MAX_PAGES;
  }

  /**
   * Обробляє навігацію по напрямку
   * @param direction
   */
  onPageNavigation(direction) {
    if (direction === "prev") {
      this.switchToPrevPage();
    } else if (direction === "next") {
      this.switchToNextPage();
    }
  }

  /**
   * Оновлює відображення сторінки
   */
  updatePageDisplay() {
    this.uiController.updatePageDisplay(this.currentPage, MAX_PAGES);
  }

  /**
   * Очищає ресурси навігаційного контролера
   */
  destroy() {
    loggers.editor.debug("🧹 Очищення NavigationController...");
    this.program = null;
    this.uiController = null;
    this.currentPage = 0;
    loggers.editor.debug("✅ NavigationController очищено");
  }
}
