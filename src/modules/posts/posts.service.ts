import { Types } from "mongoose";
import PostModel from "../../database/models/posts.model";
import {
  IPost,
  PaginatedPostsResult,
} from "../../common/interfaces/posts.interface";
import type { CreatePostDto, UpdatePostDto } from "./posts.dto";
import { DatabaseRepository } from "../../database/repository/base.repository";
import ApplicationException, {
  NotFoundException,
} from "../../common/exceptions/application.exception";

export class PostsService {
  private postRepository: DatabaseRepository<IPost>;

  constructor() {
    this.postRepository = new DatabaseRepository<IPost>(PostModel);
  }

  private resolveAuthorId(author: IPost["author"]): string {
    if (author instanceof Types.ObjectId) {
      return author.toString();
    }

    return author._id.toString();
  }

  private assertOwnership(post: IPost, userId: string): void {
    if (this.resolveAuthorId(post.author) !== userId) {
      throw new ApplicationException(
        "You are not authorized to modify this post",
        403,
        undefined
      );
    }
  }

  async createPost(userId: string, data: CreatePostDto): Promise<IPost> {
    const createdPost = await this.postRepository.create({
      title: data.title,
      content: data.content,
      author: new Types.ObjectId(userId),
      attachments: data.attachments,
      isDeleted: false,
    });

    const post = await PostModel.findById(createdPost._id).exec();

    if (!post) {
      throw new NotFoundException("Post not found after creation");
    }

    return post;
  }

  async getPosts(skip: number, limit: number): Promise<PaginatedPostsResult> {
    const [rows, count] = await Promise.all([
      PostModel.find().skip(skip).limit(limit).exec(),
      PostModel.countDocuments({ isDeleted: { $ne: true } }).exec(),
    ]);

    return { rows, count };
  }

  async getPostById(postId: string): Promise<IPost> {
    const post = await this.postRepository.findById(postId);

    if (!post || post.isDeleted) {
      throw new NotFoundException("Post not found");
    }

    return post;
  }

  async updatePost(
    postId: string,
    userId: string,
    data: UpdatePostDto
  ): Promise<IPost> {
    const post = await this.getPostById(postId);
    this.assertOwnership(post, userId);

    const updatePayload: Partial<IPost> = {};

    if (data.title !== undefined) {
      updatePayload.title = data.title;
    }
    if (data.content !== undefined) {
      updatePayload.content = data.content;
    }
    if (data.attachments !== undefined) {
      updatePayload.attachments = data.attachments;
    }

    const updatedPost = await this.postRepository.updateById(
      postId,
      updatePayload
    );

    if (!updatedPost) {
      throw new NotFoundException("Post not found");
    }

    const populatedPost = await PostModel.findById(updatedPost._id).exec();

    if (!populatedPost) {
      throw new NotFoundException("Post not found after update");
    }

    return populatedPost;
  }

  async softDeletePost(postId: string, userId: string): Promise<IPost> {
    const post = await this.getPostById(postId);
    this.assertOwnership(post, userId);

    const deletedPost = await this.postRepository.updateById(postId, {
      isDeleted: true,
    });

    if (!deletedPost) {
      throw new NotFoundException("Post not found");
    }

    return deletedPost;
  }
}

export const postsService = new PostsService();
