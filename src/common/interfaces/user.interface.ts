import { GenderEnum  , RoleEnum , ProviderEnum } from "../enums";

export interface IUser extends Document {
    username: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    email: string;
    password?: string; 
    gender: GenderEnum ;
    role: RoleEnum;
    phoneNumber?: string;
    profilePicture?: string;
    profileCoverPicture?: string;
    provider: ProviderEnum;
    createdAt: Date;
    updatedAt: Date;
}