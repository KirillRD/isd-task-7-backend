import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { CONNECTION, CONNECT_TO_ROOM, DISCONNECT_FROM_ROOM, FIR, FREE_USERS, GameName, TTT, USER } from './constants';
import { RoomStorage } from './services/RoomStorage';
import { createUser } from './services/util';
import { TicTacToe } from './services/TicTacToe';
import { Game } from './services/Game';
import { FourInRow } from './services/FourInRow';

const PORT = process.env.PORT || 3333;

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  }
});

const gameInstances = new Map<string, (firstUserId: string) => Game>([
  [GameName.TIC_TAC_TOE, (firstUserId: string) => new TicTacToe(firstUserId)],
  [GameName.FOUR_IN_ROW, (firstUserId: string) => new FourInRow(firstUserId)]
]);

const roomStorage = new RoomStorage();


io.on(CONNECTION, (socket) => {
  socket.on(FREE_USERS, (game: string) => {
    const users = roomStorage.getUsersByFreeRooms(game);
    socket.emit(FREE_USERS, users);
  });

  socket.on(CONNECT_TO_ROOM, (name: string, game: string, roomUserId?: string) => {
    let roomId: string;
    const user = createUser(name, game);
    if (roomUserId) {
      roomId = roomStorage.connectToRoom(user, roomUserId);
    } else {
      roomId = roomStorage.createRoom(user, game, gameInstances.get(game)!(user.id));
    }
    socket.join(roomId);
    socket.emit(USER, user);

    const users = roomStorage.getUsersByFreeRooms(game);
    socket.broadcast.emit(FREE_USERS, users);
  });

  socket.on(DISCONNECT_FROM_ROOM, (userId: string) => {
    const room = roomStorage.getRoomByUserId(userId);

    socket.leave(room.id);
    socket.to(room.id).emit(DISCONNECT_FROM_ROOM);
    if (room.users.length == 1) {
      roomStorage.deleteRoom(room.id);
    } else {
      const firstUserId = room.users.find(roomUser => roomUser.user.id != userId)!.user.id;
      const newGameInstance = gameInstances.get(room.game)!(firstUserId!);
      roomStorage.disconnectFromRoom(userId, newGameInstance);
    }

    const users = roomStorage.getUsersByFreeRooms(room.game);
    socket.broadcast.emit(FREE_USERS, users);
  });

  socket.on(TTT.STATE, (userId: string) => {
    const room  = roomStorage.getRoomByUserId(userId);
    const gameInstance = room.gameInstance as TicTacToe;

    if (gameInstance.secondUserId) {
      io.to(room.id).emit(
        TTT.STATE,
        gameInstance.getOwner(),
        gameInstance.getMark(),
        gameInstance.grid,
        room.users
      );
    }
  });

  socket.on(TTT.MOVE, (userId: string, cell: number, mark: string) => {
    const room = roomStorage.getRoomByUserId(userId);
    const gameInstance = room.gameInstance as TicTacToe;

    const gameResult = gameInstance.getGameResult(cell, mark);
    if (gameResult) {
      roomStorage.increaseWin(userId);
      io.to(room.id).emit(
        TTT.WIN,
        gameInstance.grid,
        userId,
        gameResult,
        room.users
      );
    } else if (gameInstance.isDraw()) {
      io.to(room.id).emit(TTT.DRAW, gameInstance.grid);
    } else {
      gameInstance.increaseMoveNumber();
      io.to(room.id).emit(
        TTT.STATE,
        gameInstance.getOwner(),
        gameInstance.getMark(),
        gameInstance.grid
      );
    }
  })

  socket.on(TTT.RESTART, (userId: string) => {
    const room = roomStorage.getRoomByUserId(userId);
    const gameInstance = room.gameInstance as TicTacToe;
    if (gameInstance.moveNumber > 1) {
      const firstUserId = gameInstance.secondUserId;
      const secondUserId = gameInstance.firstUserId;

      const newGameInstance = gameInstances.get(room.game)!(firstUserId!);
      newGameInstance.secondUserId = secondUserId;
      roomStorage.setGameInstance(room.id, newGameInstance);
    } else {
      io.to(room.id).emit(
        TTT.STATE,
        gameInstance.getOwner(),
        gameInstance.getMark(),
        gameInstance.grid
      );
    }
  })

  socket.on(FIR.STATE, (userId: string) => {
    const room  = roomStorage.getRoomByUserId(userId);
    const gameInstance = room.gameInstance as FourInRow;

    if (gameInstance.secondUserId) {
      io.to(room.id).emit(
        FIR.STATE,
        gameInstance.getOwner(),
        gameInstance.getColor(),
        gameInstance.grid,
        room.users
      );
    }
  });

  socket.on(FIR.MOVE, (userId: string, column: number, color: string) => {
    const room = roomStorage.getRoomByUserId(userId);
    const gameInstance = room.gameInstance as FourInRow;

    const gameResult = gameInstance.getGameResult(column, color);
    if (gameResult) {
      roomStorage.increaseWin(userId);
      io.to(room.id).emit(
        FIR.WIN,
        gameInstance.grid,
        userId,
        gameResult,
        room.users
      );
    } else if (gameInstance.isDraw()) {
      io.to(room.id).emit(FIR.DRAW, gameInstance.grid);
    } else {
      gameInstance.increaseMoveNumber();
      io.to(room.id).emit(
        FIR.STATE,
        gameInstance.getOwner(),
        gameInstance.getColor(),
        gameInstance.grid
      );
    }
  })

  socket.on(FIR.RESTART, (userId: string) => {
    const room = roomStorage.getRoomByUserId(userId);
    const gameInstance = room.gameInstance as FourInRow;
    if (gameInstance.moveNumber > 1) {
      const firstUserId = gameInstance.secondUserId;
      const secondUserId = gameInstance.firstUserId;

      const newGameInstance = gameInstances.get(room.game)!(firstUserId!);
      newGameInstance.secondUserId = secondUserId;
      roomStorage.setGameInstance(room.id, newGameInstance);
    } else {
      io.to(room.id).emit(
        FIR.STATE,
        gameInstance.getOwner(),
        gameInstance.getColor(),
        gameInstance.grid
      );
    }
  })
});

httpServer.listen(PORT);