import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = this.jwtService.verify(token);
        req.currentUser = {
          userId: decoded.sub,
          token,
        };
        next();
      } catch {
        throw new UnauthorizedException('Token inválido ou expirado');
      }
    } else {
      throw new UnauthorizedException('Token não fornecido');
    }
  }
}
