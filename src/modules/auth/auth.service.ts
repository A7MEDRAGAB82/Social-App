import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserModel from '../../database/models/user.model';
import { env } from '../../config/env.service';
import { BadRequestException, conflictException, NotFoundException } from '../../common/exceptions/application.exception';
import { ProviderEnum, RoleEnum } from '../../common/enums';
import type { signupDTO, loginDTO } from './auth.dto';

export class AuthService {
  

  async signup(data: signupDTO) {
    try {
      const existingUser = await UserModel.findOne({ email: data.email });
      if (existingUser) {
        throw new conflictException('User with this email already exists');
      }

      const hashedPassword = await bcrypt.hash(data.password, parseInt(env.saltRounds));

      const newUser = await UserModel.create({
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        username: `${data.firstName.toLowerCase()}${Date.now()}`,
        provider: ProviderEnum.LOCAL,
        role: RoleEnum.USER,
      });

      const token = jwt.sign(
        { id: (newUser as any)._id, email: (newUser as any).email },
        env.JWT_SECRET_KEY,
        { expiresIn: '7d' }
      );

      return {
        user: {
          id: (newUser as any)._id,
          email: (newUser as any).email,
          firstName: (newUser as any).firstName,
          lastName: (newUser as any).lastName,
          username: (newUser as any).username,
        },
        token,
      };
    } catch (error) {
      throw error;
    }
  }

  
  async login(data: loginDTO) {
    try {
      const user = await UserModel.findOne({ email: data.email });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (!(user as any).password) {
        throw new BadRequestException('User account does not have a password');
      }

      const isPasswordValid = await bcrypt.compare(data.password, (user as any).password);
      if (!isPasswordValid) {
        throw new BadRequestException('Invalid email or password');
      }

      const token = jwt.sign(
        { id: (user as any)._id, email: (user as any).email },
        env.JWT_SECRET_KEY,
        { expiresIn: '7d' }
      );

      return {
        user: {
    id: user.id,        
    email: user.email,
    username: user.username,
  },
        token,
      };
    } catch (error) {
      throw error;
    }
  }
}

export const authService = new AuthService();
