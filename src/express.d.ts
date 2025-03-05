import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      currentUser?: {
        userId: string;
        token: string;
      };
    }
  }
}
