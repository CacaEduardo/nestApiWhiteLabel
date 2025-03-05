import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../schemas/User.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(user: CreateUserDto) {
    try {
      const { email, password } = user;
      const oldUser = await this.getByEmail(email);

      if (oldUser) {
        throw new HttpException(
          'Já existe um usuário com este e-mail',
          HttpStatus.CONFLICT,
        );
      }

      if (password) {
        const newPassword = await bcrypt.hash(password, 10);
        user.password = newPassword;
      }

      const createdUser = new this.userModel(user);
      await createdUser.save();

      return {
        success: true,
        user: createdUser,
      };
    } catch (e) {
      console.error(
        `Ocorreu um erro ao tentar criar usuário, msg: ${e.message}`,
      );
      if (e instanceof HttpException) {
        throw e;
      }
      throw new HttpException(
        'Ocorreu um erro ao tentar criar usuário',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getByEmail(email: string): Promise<UserDocument | null> {
    return await this.userModel.findOne({ email }).exec();
  }

  async findAll() {
    try {
      const users = await this.userModel.find().exec();
      return {
        success: true,
        users,
      };
    } catch (e) {
      console.error(`Ocorreu um erro, msg: ${e.message}`);
      throw new HttpException(
        'Ocorreu um erro',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.userModel.findById(id).exec();

      return {
        success: true,
        user,
      };
    } catch (e) {
      console.error(`Ocorreu um erro, msg: ${e.message}`);
      throw new HttpException(
        'Ocorreu um erro',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, updateUserDto, { new: true })
        .exec();

      return {
        success: true,
        user: updatedUser,
      };
    } catch (e) {
      console.error(`Ocorreu um erro, msg: ${e.message}`);
      throw new HttpException(
        'Ocorreu um erro',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string) {
    try {
      await this.userModel.findByIdAndDelete(id).exec();
      return {
        success: true,
        msg: 'usuário removido',
      };
    } catch (e) {
      console.error(`Ocorreu um erro, msg: ${e.message}`);
      throw new HttpException(
        'Ocorreu um erro',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
