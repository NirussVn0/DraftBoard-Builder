export const BOARD_SIZE = 10;
export const TOTAL_CELLS = (BOARD_SIZE * 2) + ((BOARD_SIZE - 2) * 2); // 36

/**
 * Returns the [x, y] coordinates (0-indexed) for a given cell number.
 * Layout: Monopoly-style Outer Ring.
 * Cell 1 is top-left, going clockwise around the 10x10 perimeter.
 */
export function getCoordinatesFromCell(cell: number): { x: number; y: number } {
  let c = cell - 1; // 0 to 35
  const maxIdx = TOTAL_CELLS - 1;
  if (c < 0) c = 0;
  if (c > maxIdx) c = maxIdx;

  if (c < BOARD_SIZE) {
    // Top edge (x: 0 -> 9, y: 0)
    return { x: c, y: 0 };
  } else if (c < BOARD_SIZE + (BOARD_SIZE - 2)) {
    // Right edge (x: 9, y: 1 -> 8)
    return { x: BOARD_SIZE - 1, y: c - BOARD_SIZE + 1 };
  } else if (c < BOARD_SIZE * 2 + (BOARD_SIZE - 2)) {
    // Bottom edge (x: 9 -> 0, y: 9)
    const offset = c - (BOARD_SIZE + BOARD_SIZE - 2);
    return { x: BOARD_SIZE - 1 - offset, y: BOARD_SIZE - 1 };
  } else {
    // Left edge (x: 0, y: 8 -> 1)
    const offset = c - (BOARD_SIZE * 2 + BOARD_SIZE - 2);
    return { x: 0, y: BOARD_SIZE - 2 - offset };
  }
}

/**
 * Calculates a step-by-step path from startCell to startCell + diceRoll
 */
export function calculatePath(startCell: number, diceRoll: number): number[] {
  const path: number[] = [];
  const endCell = Math.min(startCell + diceRoll, TOTAL_CELLS);
  
  if (startCell === endCell) return path;

  for (let i = startCell + 1; i <= endCell; i++) {
    path.push(i);
  }
  return path;
}

/**
 * Returns pixel-like offsets or percentage offsets for multiple players
 * resting on the exact same board cell.
 */
export function getPlayerOffset(playerIndex: number): { offsetX: number, offsetY: number } {
  // Offset as percentage of the cell/board to keep purely numerical inputs for AnimeJS interpolation.
  const offsetX = (playerIndex % 2 === 0 ? -1 : 1) * 1.5;
  const offsetY = (playerIndex < 2 ? -1 : 1) * 1.5;
  return { offsetX, offsetY };
}

