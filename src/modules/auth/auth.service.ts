import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserModel from '../../database/models/user.model';
import { env } from '../../config/env.service';
import { BadRequestException, conflictException, NotFoundException } from '../../common/exceptions/application.exception';
import { ProviderEnum, RoleEnum } from '../../common/enums';
import type { signupDTO, loginDTO, GoogleSignupDTO, ForgetPasswordDTO, ResetPasswordDTO, UpdatePasswordDTO, IGoogleTokenPayload } from './auth.dto';
import { DatabaseRepository } from '../../database/repository/base.repository';
import { generateHash, compareHash } from '../../common/utils/security';
import { sendEmail } from '../../common/utils/email/sendEmail';
import { RedisService } from '../../common/services/redis.service';
import { TokenService } from '../../common/services/token.service';
import { OAuth2Client } from 'google-auth-library';
import type { IUser } from '../../common/interfaces/user.interface';


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

      if (!user.password) {
        throw new BadRequestException('User account does not have a password');
      }

      const isPasswordValid = await compareHash({ plainText: data.password, hash: user.password });
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

  async logout(accessToken: string): Promise<{ message: string }> {
    try {
      const decoded = this.tokenService.decodeAccessToken(accessToken);
      if (!decoded || typeof decoded === 'string') {
        throw new BadRequestException('Invalid token format');
      }

      const currentTime = Math.floor(Date.now() / 1000);
      const expirationTime = decoded.exp || 0;
      const ttlInSeconds = Math.max(0, expirationTime - currentTime);

      if (ttlInSeconds > 0) {
        await this.redisService.setValue(
          `revoked_token:${accessToken}`,
          'true',
          ttlInSeconds
        );
      }

      return { message: 'Logged out successfully' };
    } catch (error) {
      throw error;
    }
  }

  async forgetPassword(data: ForgetPasswordDTO): Promise<{ message: string }> {
    try {
      const user = await this.userRepository.findOne({ email: data.email });
      if (!user) {
        return { message: 'If this email exists in our system, you will receive a password reset link shortly' };
      }

      const resetToken = jwt.sign(
        { id: user.id, email: user.email, type: 'password_reset' },
        env.JWT_SECRET_KEY,
        { expiresIn: '30m' }
      );

      await this.redisService.setValue(
        `password_reset:${user.id}`,
        resetToken,
        30 * 60 // 30 minutes
      );

      const resetLink = `${env.BASE_URL}/reset-password?token=${resetToken}`;
      sendEmail({
        to: user.email,
        subject: 'Password Reset Request',
        text: `Hi ${user.username},\n\nYou requested to reset your password. Click the link below to proceed:\n${resetLink}\n\nThis link will expire in 30 minutes.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nThe Social App Team`,
      }).catch((error) => {
        console.error(`Failed to send reset password email to ${user.email}:`, error);
      });

      return { message: 'If this email exists in our system, you will receive a password reset link shortly' };
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(data: ResetPasswordDTO): Promise<{ message: string }> {
    try {
      const decoded = this.tokenService.verifyAccessToken(data.resetToken) as { id: string; email: string; type: string };
      
      if (!decoded || typeof decoded === 'string' || decoded.type !== 'password_reset') {
        throw new BadRequestException('Invalid or expired reset token');
      }

      const userId = decoded.id;

      const storedToken = await this.redisService.get(`password_reset:${userId}`);
      if (!storedToken || storedToken !== data.resetToken) {
        throw new BadRequestException('Reset token has been invalidated or expired');
      }

      const hashedPassword = await generateHash({
        plainText: data.newPassword,
        salt: env.saltRounds
      });

      await this.userRepository.updateById(userId, { password: hashedPassword });

      await this.redisService.redisDel(`password_reset:${userId}`);

      return { message: 'Password reset successfully' };
    } catch (error) {
      throw error;
    }
  }

  async updatePassword(userId: string, data: UpdatePasswordDTO): Promise<{ message: string }> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (!user.password) {
        throw new BadRequestException('User account does not have a password');
      }

      // Verify current password
      const isCurrentPasswordValid = await compareHash({
        plainText: data.currentPassword,
        hash: user.password
      });
      if (!isCurrentPasswordValid) {
        throw new BadRequestException('Current password is incorrect');
      }

      // Hash and update new password
      const hashedPassword = await generateHash({
        plainText: data.newPassword,
        salt: env.saltRounds
      });

      await this.userRepository.updateById(userId, { password: hashedPassword });

      return { message: 'Password updated successfully' };
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

  async signupMail(data: GoogleSignupDTO): Promise<{ user: { id: string; email: string; username: string }; tokens: { accessToken: string; refreshToken: string } }> {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: data.idToken,
        audience: env.googleClientId,
      });
      
      const payload = ticket.getPayload() as IGoogleTokenPayload | undefined;
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
          isVerified: payload.email_verified ?? false,
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
