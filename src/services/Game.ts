export abstract class Game {
  firstUserId: string;
  secondUserId?: string;
  moveNumber: number;

  constructor(firstUserId: string, moveNumber: number) {
    this.firstUserId = firstUserId;
    this.moveNumber = moveNumber;
  }

  increaseMoveNumber() {
    this.moveNumber++;
  }
}
