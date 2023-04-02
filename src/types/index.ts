import { Game } from '../services/Game';

export type User = {
  id: string;
  name: string;
  game: string;
}

export type RoomUser = {
  user: User;
  wins: number;
}

export type Room = {
  id: string;
  game: string;
  gameInstance: Game;
  users: [RoomUser] | [RoomUser, RoomUser];
}
