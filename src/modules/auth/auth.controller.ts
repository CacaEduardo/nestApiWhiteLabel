import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  Request,
  UsePipes,
  Get,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signin.dto';
import { Request as RequestI } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signin')
  @UsePipes(new ValidationPipe())
  async signIn(@Body() data: SignInDto) {
    return this.authService.signIn(data);
  }

  @Get('/signinByToken')
  async signInByToken(@Request() req: RequestI) {
    if (!req.currentUser) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
    return this.authService.signInByToken(req.currentUser);
  }
}
