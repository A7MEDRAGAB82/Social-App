import { IUser } from "../../common/interfaces";
import UserModel from "../../database/models/user.model";
import { DatabaseRepository } from "../../database/repository/base.repository";
import { NotFoundException } from "../../common/exceptions/application.exception";
import {
  ProfileImageFolder,
  s3Service,
} from "../../common/services/s3.service";
import { PresignedUploadResult } from "../../common/interfaces/s3.interface";

type ProfileImageField = "profilePicture" | "profileCoverPicture";

const IMAGE_FIELD_BY_FOLDER: Record<
  ProfileImageFolder,
  ProfileImageField
> = {
  "profile-pictures": "profilePicture",
  "cover-pictures": "profileCoverPicture",
};

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
    imageUrl: string
  ): Promise<IUser> {
    const userData = await this.userRepository.updateById(userId, {
      [field]: imageUrl,
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

  async getPresignedProfileImageUpload(
    userId: string,
    folder: ProfileImageFolder,
    fileName: string,
    contentType: string
  ): Promise<PresignedUploadResult> {
    const key = s3Service.buildUserImageKey(userId, folder, fileName);

    return s3Service.getPresignedUploadUrl({ key, contentType });
  }

  async confirmProfileImageUpload(
    userId: string,
    folder: ProfileImageFolder,
    key: string
  ): Promise<IUser> {
    s3Service.assertUserImageKey(userId, key, folder);

    const imageUrl = s3Service.getPublicUrl(key);
    const field = IMAGE_FIELD_BY_FOLDER[folder];

    return this.updateProfileImage(userId, field, imageUrl);
  }

  async updateProfilePicture(
    userId: string,
    imageUrl: string
  ): Promise<IUser> {
    return this.updateProfileImage(userId, "profilePicture", imageUrl);
  }

  async updateProfileCoverPicture(
    userId: string,
    imageUrl: string
  ): Promise<IUser> {
    return this.updateProfileImage(userId, "profileCoverPicture", imageUrl);
  }
}

export const userService = new UserService();
