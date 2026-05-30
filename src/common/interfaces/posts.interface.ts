import { Document, Types } from "mongoose";

export interface IPostAuthor {
  _id: Types.ObjectId;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
}

export interface IPost extends Document {
  title: string;
  content: string;
  author: Types.ObjectId | IPostAuthor;
  attachments: string[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedPostsResult {
  rows: IPost[];
  count: number;
}
