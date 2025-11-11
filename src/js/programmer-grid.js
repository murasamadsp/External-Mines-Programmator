function createProgrammerGrid(container) {
  const grid = document.createElement('div');
  grid.classList.add('programmer-grid');

  // Header Row
  const cornerCell = document.createElement('div');
  cornerCell.classList.add('header-cell', 'corner');
  grid.appendChild(cornerCell);
  for (let i = 1; i <= 10; i++) {
    const headerCell = document.createElement('div');
    headerCell.classList.add('header-cell');
    headerCell.textContent = i;
    grid.appendChild(headerCell);
  }

  // Grid Rows
  for (let i = 0; i < 10; i++) {
    const rowHeader = document.createElement('div');
    rowHeader.classList.add('header-cell');
    rowHeader.textContent = String.fromCharCode(65 + i);
    grid.appendChild(rowHeader);
    for (let j = 0; j < 10; j++) {
      const cell = document.createElement('div');
      cell.classList.add('grid-cell');
      grid.appendChild(cell);
    }
  }

  container.appendChild(grid);
}

const container = document.getElementById('programmer-grid-container');
if (container) {
  createProgrammerGrid(container);
}
