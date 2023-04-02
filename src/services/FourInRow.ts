import { Game } from './Game';

export class FourInRow extends Game {
  readonly red = 'r';
  readonly blue = 'b';
  readonly rowCount = 6;
  readonly columnCount = 7;
  readonly winComboLength = 4;
  readonly winDeltaLength = this.winComboLength - 1;
  readonly drawMoveNumber = this.rowCount * this.columnCount;
  grid: string[][];

  constructor(firstUserId: string) {
    super(firstUserId, 1);
    this.grid = Array(this.rowCount).fill(null).map(()=>Array(this.columnCount).fill(''));
  }

  getColor(): 'r' | 'b' {
    return this.moveNumber % 2 ? this.red : this.blue;
  }

  getOwner(): string {
    return this.moveNumber % 2 ? this.firstUserId : this.secondUserId!;
  }

  getGameResult(column: number, color: string): number[][] | undefined {
    const row = this.rebuildGrid(column, color);

    const leftBorder = this.getLeftBorder(column);
    const rightBorder = this.getRightBorder(column);
    const bottomBorder = this.getBottomBorder(row);
    const topBorder = this.getTopBorder(row);

    const topRightDiagonalDelta = this.getTopRightDiagonalDelta(row, column, topBorder, rightBorder);
    const topLeftDiagonalDelta = this.getTopLeftDiagonalDelta(row, column, topBorder, leftBorder);
    const bottomRightDiagonalDelta = this.getBottomRightDiagonalDelta(row, column, bottomBorder, rightBorder);
    const bottomLeftDiagonalDelta = this.getBottomLeftDiagonalDelta(row, column, bottomBorder, leftBorder);

    return (
      this.getHorizontalWinCombo(color, row, leftBorder, rightBorder) ||
      this.getMajorDiagonalWinCombo(color, row, column, topLeftDiagonalDelta, bottomRightDiagonalDelta) ||
      this.getMinorDiagonalWinCombo(color, row, column, bottomLeftDiagonalDelta, topRightDiagonalDelta) ||
      this.getVerticalWinCombo(color, row, column, bottomBorder)
    );
  }

  rebuildGrid(column: number, color: string): number {
    const rowIndex = this.grid.findIndex((row) => !row[column]);
    this.grid[rowIndex][column] = color;
    return rowIndex;
  }

  getLeftBorder(column: number): number {
    return column <= this.winDeltaLength ? 0 : column - this.winDeltaLength;
  }

  getRightBorder(column: number): number {
    const rightBorder = column + this.winDeltaLength;
    return rightBorder >= this.columnCount ? this.columnCount - 1 : rightBorder;
  }

  getBottomBorder(row: number): number {
    return row <= this.winDeltaLength ? 0 : row - this.winDeltaLength;
  }

  getTopBorder(row: number): number {
    const topBorder = row + this.winDeltaLength;
    return topBorder >= this.rowCount ? this.rowCount - 1 : topBorder;
  }

  getTopRightDiagonalDelta(row: number, column:number, topBorder: number, rightBorder: number): number {
    return topBorder - row <= rightBorder - column ? topBorder - row : rightBorder - column;
  }

  getTopLeftDiagonalDelta(row: number, column:number, topBorder: number, leftBorder: number): number {
    return topBorder - row <= column - leftBorder ? topBorder - row : column - leftBorder;
  }

  getBottomRightDiagonalDelta(row: number, column:number, bottomBorder: number, rightBorder: number): number {
    return row - bottomBorder <= rightBorder - column ? row - bottomBorder : rightBorder - column;
  }

  getBottomLeftDiagonalDelta(row: number, column:number, bottomBorder: number, leftBorder: number): number {
    return row - bottomBorder <= column - leftBorder ? row - bottomBorder : column - leftBorder;
  }

  getHorizontalWinCombo(color: string, row: number, leftBorder: number, rightBorder: number): number[][] | undefined {
    for (let winCombo = [], i = leftBorder; i <= rightBorder; i++) {
      if (this.grid[row][i] == color) {
        winCombo.push([row, i]);
        if (winCombo.length == this.winComboLength) {
          return winCombo;
        }
      } else if (winCombo.length) {
        winCombo = [];
      }
    }
  }

  getMajorDiagonalWinCombo(color: string, row: number, column: number, topLeftDiagonalDelta: number, bottomRightDiagonalDelta: number): number[][] | undefined {
    for (
      let winCombo = [],
      i = row + topLeftDiagonalDelta,
      j = column - topLeftDiagonalDelta,
      k = 0; k <= topLeftDiagonalDelta + bottomRightDiagonalDelta; k++) {
      if (this.grid[i - k][j + k] == color) {
        winCombo.push([i - k, j + k]);
        if (winCombo.length == this.winComboLength) {
          return winCombo;
        }
      } else if (winCombo.length) {
        winCombo = [];
      }
    }
  }

  getMinorDiagonalWinCombo(color: string, row: number, column: number, bottomLeftDiagonalDelta: number, topRightDiagonalDelta: number): number[][] | undefined {
    for (
      let winCombo = [],
      i = row - bottomLeftDiagonalDelta,
      j = column - bottomLeftDiagonalDelta,
      k = 0; k <= bottomLeftDiagonalDelta + topRightDiagonalDelta; k++) {
      if (this.grid[i + k][j + k] == color) {
        winCombo.push([i + k, j + k]);
        if (winCombo.length == this.winComboLength) {
          return winCombo;
        }
      } else if (winCombo.length) {
        winCombo = [];
      }
    }
  }

  getVerticalWinCombo(color: string, row: number, column: number, bottomBorder: number): number[][] | undefined {
    for (let winCombo = [], i = bottomBorder; i <= row; i++) {
      if (this.grid[i][column] == color) {
        winCombo.push([i, column]);
        if (winCombo.length == this.winComboLength) {
          return winCombo;
        }
      } else if (winCombo.length) {
        winCombo = [];
      }
    }
  }

  isDraw(): boolean {
    return this.moveNumber == this.drawMoveNumber;
  }
}
