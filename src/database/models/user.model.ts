import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "../../common/interfaces/user.interface";
import { GenderEnum, ProviderEnum, RoleEnum } from "../../common/enums";






const userSchema = new Schema<IUser>({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    password: { type: String, required: function(this: IUser) { return this.provider === ProviderEnum.LOCAL; } },
    isVerified: { type: Boolean, default: false },
    gender: { 
        type: String, 
        enum: Object.values(GenderEnum), 
        default: GenderEnum.MALE 
    },
    role: { 
        type: String, 
        enum: Object.values(RoleEnum), 
        default: RoleEnum.USER 
    },
    provider: { 
        type: String, 
        enum: Object.values(ProviderEnum), 
        default: ProviderEnum.LOCAL 
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now } 
}, {
    timestamps: true ,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

userSchema.virtual('fullName').set(function(this: IUser) {
    let fullName = "";
    if (this.firstName) fullName += this.firstName;
    if (this.lastName) fullName += ` ${this.lastName}`;
    return fullName.trim();
}).get(function(this: IUser) {
    return `${this.firstName} ${this.lastName}`;
});


 const UserModel = mongoose.model<IUser>('User', userSchema);
 export default UserModel;