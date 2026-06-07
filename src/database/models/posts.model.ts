import mongoose, { Query, Schema } from "mongoose";
import { IPost } from "../../common/interfaces/posts.interface";

const postSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
      minlength: [1, "Content cannot be empty"],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
      index: true,
    },
    attachments: {
      type: [String],
      default: [],
      validate: {
        validator: (values: string[]) =>
          values.every((url) => typeof url === "string" && url.length > 0),
        message: "Each attachment must be a non-empty URL string",
      },
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

postSchema.pre(/^find/, function (this: Query<IPost, IPost>) {
  this.where({ isDeleted: { $ne: true } });
  void this.populate("author", "firstName lastName profilePicture");
});

const PostModel = mongoose.model<IPost>("Post", postSchema);

export default PostModel;
