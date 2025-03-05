import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { getModelToken } from '@nestjs/mongoose';
import { User } from 'src/schemas/User.schema';
import { JwtService } from '@nestjs/jwt';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    signIn: jest.fn(),
    signInByToken: jest.fn(),
  };

  const mockUserModel = {
    findOne: jest.fn(),
    findById: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('signIn', () => {
    it('deve chamar signIn e retornar uma resposta válida', async () => {
      const signInDto = { email: 'teste@example.com', password: 'senha' };
      const mockResponse = {
        success: true,
        data: {
          user: {
            _id: '1',
            name: 'Usuário Teste',
            email: 'teste@example.com',
          },
          token: 'token.jwt.válido',
        },
      };

      mockAuthService.signIn.mockResolvedValue(mockResponse);

      const result = await controller.signIn(signInDto);

      expect(authService.signIn).toHaveBeenCalledWith(signInDto);
      expect(result).toEqual(mockResponse);
    });

    it('deve lançar UnauthorizedException se o usuário não for encontrado', async () => {
      const signInDto = { email: 'teste@example.com', password: 'senhaerrada' };

      mockAuthService.signIn.mockRejectedValue(
        new UnauthorizedException('usuário não encontrado'),
      );

      await expect(controller.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('signInByToken', () => {
    it('deve chamar signInByToken e retornar uma resposta válida', async () => {
      const mockUserId = '1';
      const mockToken = 'token.jwt.válido';
      const mockUser = {
        _id: '1',
        name: 'Usuário Teste',
        email: 'teste@example.com',
      };
      const mockResponse = {
        success: true,
        data: {
          user: mockUser,
          token: mockToken,
        },
      };

      const req: Request = Object.assign({
        currentUser: { userId: mockUserId, token: mockToken },
      });

      mockAuthService.signInByToken.mockResolvedValue(mockResponse);

      const result = await controller.signInByToken(req);

      expect(authService.signInByToken).toHaveBeenCalledWith({
        userId: mockUserId,
        token: mockToken,
      });
      expect(result).toEqual(mockResponse);
    });
  });
});
