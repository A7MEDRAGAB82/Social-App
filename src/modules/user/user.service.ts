import { IUser } from "../../common/interfaces";
import UserModel from "../../database/models/user.model";
import { DatabaseRepository } from "../../database/repository/base.repository";
import { NotFoundException } from "../../common/exceptions/application.exception";

export class UserService {
  private userRepository: DatabaseRepository<IUser>;

  constructor() {
    this.userRepository = new DatabaseRepository<IUser>(UserModel);
  }

  async getUserProfile(userId: string): Promise<IUser> {
    let userData = await this.userRepository.findById(userId);
    if (!userData) {
      throw new NotFoundException("User not found");
    }
    if ((userData as { password?: string }).password) delete (userData as { password?: string }).password;
    return userData;
  }

  async updateUserProfile(userId: string, updateData: Partial<IUser>): Promise<IUser> {
    let userData = await this.userRepository.updateById(userId, updateData);
    if (!userData) {
      throw new NotFoundException("User not found");
    }
    if ((userData as { password?: string }).password) delete (userData as { password?: string }).password;
    return userData;
  
}

}

export const userService = new UserService();