import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserModel from '../../database/models/user.model';
import { env } from '../../config/env.service';
import { BadRequestException, conflictException, NotFoundException } from '../../common/exceptions/application.exception';
import { ProviderEnum, RoleEnum } from '../../common/enums';
import type { signupDTO, loginDTO } from './auth.dto';
import { DatabaseRepository } from '../../database/repository/base.repository';
import { generateHash, compareHash } from '../../common/utils/security';
import { sendEmail } from '../../common/utils/email/sendEmail';

export class AuthService {
  private userModel = UserModel;
  private userRepository : DatabaseRepository<typeof UserModel.prototype>;

  constructor() {
    this.userRepository = new DatabaseRepository(this.userModel);
  }

  async signup(data: signupDTO) {
    try {
      const existingUser = await this.userRepository.findOne({ email: data.email });
      if (existingUser) {
        throw new conflictException('User with this email already exists');
      }

      const hashedPassword = await generateHash({ plainText: data.password, salt: env.saltRounds });

      const newUser = await this.userRepository.create({
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        username: `${data.firstName.toLowerCase()}${Date.now()}`,
        provider: ProviderEnum.LOCAL,
        role: RoleEnum.USER,
      });

      sendEmail({
        to: newUser.email,
        subject: 'Welcome to Our Social App!',
        text: `Hi ${newUser.username},\n\nThank you for signing up for our social app! We're excited to have you on board.\n\nBest regards,\nThe Social App Team`,
      }).catch((error) => {
        console.error(`Failed to send welcome email to ${newUser.email}:`, error);
      });

      return {
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          username: newUser.username,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  
  async login(data: loginDTO) {
    try {
      const user = await this.userRepository.findOne({ email: data.email });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (!(user as any).password) {
        throw new BadRequestException('User account does not have a password');
      }

      const isPasswordValid = await compareHash({ plainText: data.password, hash: (user as any).password });
      if (!isPasswordValid) {
        throw new BadRequestException('Invalid email or password');
      }


      return {
        user: {
    id: user.id,        
    email: user.email,
    username: user.username,
  },
      };
    } catch (error) {
      throw error;
    }
  }
}

export const authService = new AuthService();
