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
import { RedisService } from '../../common/services/redis.service';
import { TokenService } from '../../common/services/token.service';
import { OAuth2Client } from 'google-auth-library';


export class AuthService {
  private userModel = UserModel;
  private userRepository : DatabaseRepository<typeof UserModel.prototype>;
  private redisService : RedisService;
  private tokenService : TokenService;
  private googleClient: OAuth2Client;

  constructor() {
    this.userRepository = new DatabaseRepository(this.userModel);
    this.redisService = new RedisService();
    this.tokenService = new TokenService();
    this.googleClient = new OAuth2Client(env.googleClientId, env.googleClientSecret);
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

      let code = Math.floor(100000 + Math.random() * 900000).toString();
      let hashCode = await generateHash({ plainText: code, salt: env.saltRounds });
      await this.redisService.setValue(`otp:${newUser.id}`, hashCode, 10 * 60); 
      sendEmail({
        to: newUser.email,
        subject: 'Welcome to Our Social App!',
        text: `Hi ${newUser.username},\n\nThank you for signing up for our social app! We're excited to have you on board.\n\nBest regards,\nThe Social App Team , and your verification code is ${code}`,
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


      const { accessToken, refreshToken } = this.tokenService.generateTokens({ id: user.id, email: user.email });

      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
        tokens: {
          accessToken,
          refreshToken
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async verifyEmail(userId: string, code: string) {
    try {
      const storedHash = await this.redisService.get(`otp:${userId}`);
      if (!storedHash) {
        throw new BadRequestException('Verification code has expired or is invalid');
      }

      const isCodeValid = await compareHash({ plainText: code, hash: storedHash });
      if (!isCodeValid) {
        throw new BadRequestException('Invalid verification code');
      }

      await this.userRepository.update({ isVerified: true }, { id: userId });
      await this.redisService.redisDel(`otp:${userId}`);
      return { message: 'Email verified successfully' };
    } catch (error) {
      throw error;
    }

  }

  async signupMail(idToken: string)  : Promise<{ user: { id: string; email: string; username: string }; tokens: { accessToken: string; refreshToken: string } }> {
   try {
    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: env.googleClientId,
    });
    
    const payload = ticket.getPayload();
    if (!payload) {
      throw new BadRequestException('Invalid Google token');
    }
    
    const email = payload.email;
    if (!email) {
      throw new BadRequestException('Google token payload missing email');
    }

    let user = await this.userRepository.findOne({ email });

    if (!user) {
      const firstName = payload.given_name ?? '';
      const lastName = payload.family_name ?? '';
      const usernameBase = firstName || email.split('@')[0] || 'user';

      user = await this.userRepository.create({
        email,
        firstName,
        lastName,
        username: `${usernameBase.toLowerCase()}${Date.now()}`,
        provider: ProviderEnum.GOOGLE,
        role: RoleEnum.USER,
      });
    } else {
      if (user.provider !== ProviderEnum.GOOGLE) {
        throw new BadRequestException('This email is registered via password. Please log in using your password.');
      }
    }

    const { accessToken, refreshToken } = this.tokenService.generateTokens({ 
      id: user.id, 
      email: user.email 
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      tokens: {
        accessToken,
        refreshToken
      }
    };

  } catch (error) {
    throw error;
  }

  }

}

export const authService = new AuthService();
