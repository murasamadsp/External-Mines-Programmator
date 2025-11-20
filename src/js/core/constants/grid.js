// Grid dimensions and layout constants
export const GRID_WIDTH = 16;
export const GRID_HEIGHT = 12;
export const GRID_SIZE = GRID_WIDTH * GRID_HEIGHT;

// Page dimensions (for pagination in editor)
export const PAGE_WIDTH = GRID_WIDTH;
export const PAGE_HEIGHT = GRID_HEIGHT;
export const PAGE_SIZE = PAGE_WIDTH * PAGE_HEIGHT;
export const MAX_PAGES = 16; // 00-15 pages

// Maximum values
export const MAX_INSTRUCTIONS = GRID_SIZE * MAX_PAGES; // 192 * 16 = 3072
export const MAX_LABEL_LENGTH = 3;
