import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { SignInDto } from './dto/signin.dto';
import { UserDocument, User } from 'src/schemas/User.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async signIn(data: SignInDto) {
    try {
      const { email, password } = data;
      const user = await this.userModel.findOne({ email }).exec();

      if (!user || !user.password) {
        throw new UnauthorizedException('usuário não encontrado');
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        throw new UnauthorizedException('credenciais incorretas');
      }

      const payload = { sub: user._id, email: user.email };
      const token = this.jwtService.sign(payload);

      return {
        success: true,
        data: {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
          },
          token,
        },
      };
    } catch (e) {
      console.error(
        `Ocorreu um erro ao validar as credenciais, msg: ${e.message}`,
      );
      if (e instanceof UnauthorizedException) {
        throw e;
      }
      throw new HttpException(
        'Ocorreu um erro ao validar as credenciais',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async signInByToken(currentUser: { userId: string; token: string }) {
    try {
      const { userId, token } = currentUser;
      const user = await this.userModel.findById(userId).exec();

      if (!user) {
        throw new UnauthorizedException('usuário não encontrado');
      }

      return {
        success: true,
        data: {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
          },
          token,
        },
      };
    } catch (e) {
      console.error(
        `Ocorreu um erro ao validar as credenciais, msg: ${e.message}`,
      );
      if (e instanceof UnauthorizedException) {
        throw e;
      }
      throw new HttpException(
        'Ocorreu um erro ao validar as credenciais',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
