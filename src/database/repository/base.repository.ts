import { Model } from "mongoose";
import { IUser } from "../../common/interfaces";



export class DatabaseRepository  {
    constructor(private model: Model<IUser>) {
        this.model = model;
    }

     create(data: Partial<IUser>): Promise<IUser> { 
        return this.model.create(data as any);

    }

        findOne(filter: Partial<IUser>): Promise<IUser | null> {
        return this.model.findOne(filter as any).exec();
    }

    findById(id: string): Promise<IUser | null> {
        return this.model.findById(id).exec();
    }

    updateById(id: string, data: Partial<IUser>): Promise<IUser | null> {
        return this.model.findByIdAndUpdate(id, data as any, { new: true }).exec();
    }

    deleteById(id: string): Promise<IUser | null> {
        return this.model.findByIdAndDelete(id).exec();
    }


    
}