import crypto from 'crypto';
import { User } from '../types/index';

export const randomId = (): string => {
  return crypto.randomUUID();
}

export const createUser = (name: string, game: string): User => {
  return {
    id: randomId(),
    name,
    game
  };
}
