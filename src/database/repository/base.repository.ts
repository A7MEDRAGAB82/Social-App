import { Model } from "mongoose";
import { IUser } from "../../common/interfaces";



export class DatabaseRepository<TRawDocs>  {
    constructor(private model: Model<TRawDocs>) {
        this.model = model;
    }

     create(data: Partial<TRawDocs>): Promise<TRawDocs> { 
        return this.model.create(data as any);

    }

        findOne(filter: Partial<TRawDocs>): Promise<TRawDocs | null> {
        return this.model.findOne(filter as any).exec();
    }

    findById(id: string): Promise<TRawDocs | null> {
        return this.model.findById(id).exec();
    }

    updateById(id: string, data: Partial<TRawDocs>): Promise<TRawDocs | null> {
        return this.model.findByIdAndUpdate(id, data as any, { new: true }).exec();
    }

    deleteById(id: string): Promise<TRawDocs | null> {
        return this.model.findByIdAndDelete(id).exec();
    }
    

    

    
}