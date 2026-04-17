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

export function calculatePath(startCell: number, diceRoll: number): number[] {
  const path: number[] = [];
  const endCell = Math.min(startCell + diceRoll, TOTAL_CELLS);
  
  if (startCell === endCell) return path;

  for (let i = startCell + 1; i <= endCell; i++) {
    path.push(i);
  }
  return path;
}

export function getPlayerOffset(playerIndex: number): { offsetX: number, offsetY: number } {
  const offsetX = (playerIndex % 2 === 0 ? -1 : 1) * 1.5;
  const offsetY = (playerIndex < 2 ? -1 : 1) * 1.5;
  return { offsetX, offsetY };
}
