export const BOARD_SIZE = 10;
export const TOTAL_CELLS = (BOARD_SIZE * 2) + ((BOARD_SIZE - 2) * 2);

export function getCoordinatesFromCell(cell: number): { x: number; y: number } {
  let c = cell - 1;
  const maxIdx = TOTAL_CELLS - 1;
  if (c < 0) c = 0;
  if (c > maxIdx) c = maxIdx;

  if (c < BOARD_SIZE) {
    return { x: c, y: 0 };
  } else if (c < BOARD_SIZE + (BOARD_SIZE - 2)) {
    return { x: BOARD_SIZE - 1, y: c - BOARD_SIZE + 1 };
  } else if (c < BOARD_SIZE * 2 + (BOARD_SIZE - 2)) {
    const offset = c - (BOARD_SIZE + BOARD_SIZE - 2);
    return { x: BOARD_SIZE - 1 - offset, y: BOARD_SIZE - 1 };
  } else {
    const offset = c - (BOARD_SIZE * 2 + BOARD_SIZE - 2);
    return { x: 0, y: BOARD_SIZE - 2 - offset };
  }
}

export function calculatePath(startCell: number, diceRoll: number, maxCell: number = TOTAL_CELLS): number[] {
  const path: number[] = [];
  let current = startCell;
  let forward = true;

  for (let i = 0; i < diceRoll; i++) {
    if (forward) {
      current++;
      if (current === maxCell) {
        forward = false;
      }
    } else {
      current--;
    }
    path.push(current);
  }
  
  return path;
}

export function getPlayerOffset(playerIndex: number): { offsetX: number, offsetY: number } {
  const offsetX = (playerIndex % 2 === 0 ? -1 : 1) * 1.5;
  const offsetY = (playerIndex < 2 ? -1 : 1) * 1.5;
  return { offsetX, offsetY };
}
