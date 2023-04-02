import { Room, RoomUser, User } from '../types/index';
import { Game } from './Game';
import { randomId } from './util';

export class RoomStorage {
  rooms: Room[] = [];

  constructor() {}

  createRoom(user: User, game: string, gameInstance: Game): string {
    const id = randomId();
    this.rooms.push({
      id,
      game,
      gameInstance,
      users: [{
        user,
        wins: 0
      }]
    });
    return id;
  }

  connectToRoom(user: User, roomUserId: string): string {
    const room = this.rooms.find(room => room.users[0].user.id == roomUserId)!;
    room.gameInstance.secondUserId = user.id;
    room.users[1] = {
      user,
      wins: 0
    };
    return room.id;
  }

  setGameInstance(roomId: string, gameInstance: Game) {
    const room = this.rooms.find(room => room.id == roomId)!;
    room.gameInstance = gameInstance;
  }

  getUsersByFreeRooms(game: string): User[] {
    return this.rooms.filter(room => room.game == game && room.users.length == 1).map(room => room.users[0].user);
  }

  deleteRoom(roomId: string) {
    this.rooms = this.rooms.filter((room) => room.id != roomId);
  }

  disconnectFromRoom(userId: string, gameInstance: Game) {
    const room = this.rooms.find(room => room.users.some(roomUser => roomUser.user.id == userId))!;
    room.users = room.users.filter(roomUser => roomUser.user.id != userId) as [RoomUser];
    room.gameInstance = gameInstance;
    room.users[0].wins = 0;
  }

  getRoomByUserId(userId: string): Room {
    const room = this.rooms.find(room => room.users.some(roomUser => roomUser.user.id == userId))!;
    return room;
  }

  increaseWin(userId: string) {
    const room = this.rooms.find(room => room.users.some(roomUser => roomUser.user.id == userId))!;
    const roomUser = room.users.find(roomUser => roomUser.user.id == userId)!;
    roomUser.wins++;
  }
}
