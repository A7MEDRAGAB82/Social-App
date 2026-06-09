import { IUser } from '../../common/interfaces';
import { UserService } from '../../modules/user/user.service';
import { s3Service } from '../../common/services/s3.service';
import { GraphQLContext } from '../context';
import { GenderEnum } from '../../common/enums';

const userService = new UserService();

export const userResolvers = {
  Query: {
    getUser: async (_: any, { id }: { id: string }) => {
      try {
        const user = await userService.getUserProfile(id);
        return user;
      } catch (error) {
        throw error;
      }
    },

    getCurrentUser: async (_: any, __: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error('Unauthorized: No user in context');
      }
      try {
        const user = await userService.getUserProfile(context.user.id);
        return user;
      } catch (error) {
        throw error;
      }
    },

    getUserByEmail: async (_: any, { email }: { email: string }) => {
      try {
        // Note: UserService doesn't have a getUserByEmail method yet
        // You may need to add this to the UserService if needed
        throw new Error('getUserByEmail not yet implemented. Add to UserService if needed.');
      } catch (error) {
        throw error;
      }
    },
  },

  Mutation: {
    updateUserProfile: async (
      _: any,
      {
        firstName,
        lastName,
        phoneNumber,
        gender,
      }: {
        firstName?: string;
        lastName?: string;
        phoneNumber?: string;
        gender?: string;
      },
      context: GraphQLContext
    ) => {
      if (!context.user) {
        throw new Error('Unauthorized: No user in context');
      }

      try {
        const updateData: Partial<IUser> = {};
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (phoneNumber) updateData.phoneNumber = phoneNumber;
        if (gender) updateData.gender = gender as GenderEnum;

        const user = await userService.updateUserProfile(context.user.id, updateData);
        return user;
      } catch (error) {
        throw error;
      }
    },

    uploadProfilePicture: async (
      _: any,
      { key }: { key: string },
      context: GraphQLContext
    ) => {
      if (!context.user) {
        throw new Error('Unauthorized: No user in context');
      }

      try {
        const imageUrl = s3Service.getPublicUrl(key);
        const user = await userService.updateProfilePicture(context.user.id, imageUrl);
        return user;
      } catch (error) {
        throw error;
      }
    },

    uploadCoverPicture: async (
      _: any,
      { key }: { key: string },
      context: GraphQLContext
    ) => {
      if (!context.user) {
        throw new Error('Unauthorized: No user in context');
      }

      try {
        const imageUrl = s3Service.getPublicUrl(key);
        const user = await userService.updateProfileCoverPicture(context.user.id, imageUrl);
        return user;
      } catch (error) {
        throw error;
      }
    },
  },

  User: {
    fullName: (user: IUser) => {
      if (user.firstName && user.lastName) {
        return `${user.firstName} ${user.lastName}`;
      }
      return user.firstName || user.lastName || '';
    },
  },
};
