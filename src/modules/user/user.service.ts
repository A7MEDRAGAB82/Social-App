import { IUser } from "../../common/interfaces";
import UserModel from "../../database/models/user.model";
import { DatabaseRepository } from "../../database/repository/base.repository";
import { NotFoundException } from "../../common/exceptions/application.exception";

type ProfileImageField = "profilePicture" | "profileCoverPicture";

export class UserService {
  private userRepository: DatabaseRepository<IUser>;

  constructor() {
    this.userRepository = new DatabaseRepository<IUser>(UserModel);
  }

  private sanitizeUser(user: IUser): IUser {
    if (user.password) {
      delete user.password;
    }
    return user;
  }

  private async updateProfileImage(
    userId: string,
    field: ProfileImageField,
    imagePath: string
  ): Promise<IUser> {
    const userData = await this.userRepository.updateById(userId, {
      [field]: imagePath,
    });

    if (!userData) {
      throw new NotFoundException("User not found");
    }

    return this.sanitizeUser(userData);
  }

  async getUserProfile(userId: string): Promise<IUser> {
    const userData = await this.userRepository.findById(userId);
    if (!userData) {
      throw new NotFoundException("User not found");
    }
    return this.sanitizeUser(userData);
  }

  async updateUserProfile(
    userId: string,
    updateData: Partial<IUser>
  ): Promise<IUser> {
    const userData = await this.userRepository.updateById(userId, updateData);
    if (!userData) {
      throw new NotFoundException("User not found");
    }
    return this.sanitizeUser(userData);
  }

  async updateProfilePicture(
    userId: string,
    imagePath: string
  ): Promise<IUser> {
    return this.updateProfileImage(userId, "profilePicture", imagePath);
  }

  async updateProfileCoverPicture(
    userId: string,
    imagePath: string
  ): Promise<IUser> {
    return this.updateProfileImage(userId, "profileCoverPicture", imagePath);
  }
}

export const userService = new UserService();
