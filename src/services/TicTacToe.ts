import { Game } from './Game';

export class TicTacToe extends Game {
  readonly cross = 'x';
  readonly circle = 'o';
  readonly drawMoveNumber = 9;
  grid: string[];

  readonly winCombos: number[][] = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  constructor(firstUserId: string) {
    super(firstUserId, 1);
    this.grid = Array(9).fill('');
  }

  getMark(): 'x' | 'o' {
    return this.moveNumber % 2 ? this.cross : this.circle;
  }

  getOwner(): string {
    return this.moveNumber % 2 ? this.firstUserId : this.secondUserId!;
  }

  getGameResult(cell: number, mark: string): number[] | undefined {
    this.rebuildGrid(cell, mark);

    for (let comb of this.winCombos) {
      if (
        this.grid[comb[0]] == this.grid[comb[1]] &&
        this.grid[comb[1]] == this.grid[comb[2]] &&
        this.grid[comb[0]] != ''
      ) {
        return comb;
      }
    }
  }

  rebuildGrid(cell: number, mark: string) {
    this.grid[cell] = mark;
  }

  isDraw(): boolean {
    return this.moveNumber == this.drawMoveNumber;
  }
}
