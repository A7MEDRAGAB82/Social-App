import { PostsService } from '../../modules/posts/posts.service';
import { GraphQLContext } from '../context';


const postsService = new PostsService();

export const postResolvers = {
  Query: {
    getPost: async (_: any, { id }: { id: string }) => {
      try {
        const post = await postsService.getPostById(id);
        return post;
      } catch (error) {
        throw error;
      }
    },

    getAllPosts: async (
      _: any,
      { limit = 10, offset = 0 }: { limit?: number; offset?: number }
    ) => {
      try {
        const result = await postsService.getPosts(offset, limit);
        return result.rows;
      } catch (error) {
        throw error;
      }
    },

    getUserPosts: async (
      _: any,
      { userId, limit = 10, offset = 0 }: { userId: string; limit?: number; offset?: number }
    ) => {
      try {
        const result = await postsService.getPosts(offset, limit);
        return result.rows.filter((post: any) => post.author.toString() === userId);
      } catch (error) {
        throw error;
      }
    },
  },

  Mutation: {
    createPost: async (
      _: any,
      { content }: { content: string },
      context: GraphQLContext
    ) => {
      if (!context.user) {
        throw new Error('Unauthorized: No user in context');
      }

      try {
        const post = await postsService.createPost(context.user.id, { content, title: '', attachments: [] });
        return post;
      } catch (error) {
        throw error;
      }
    },

    updatePost: async (
      _: any,
      { id, content }: { id: string; content: string },
      context: GraphQLContext
    ) => {
      if (!context.user) {
        throw new Error('Unauthorized: No user in context');
      }

      try {
        const post = await postsService.updatePost(id, context.user.id, { content });
        return post;
      } catch (error) {
        throw error;
      }
    },

    deletePost: async (
      _: any,
      { id }: { id: string },
      context: GraphQLContext
    ) => {
      if (!context.user) {
        throw new Error('Unauthorized: No user in context');
      }

      try {
        await postsService.softDeletePost(id, context.user.id);
        return true;
      } catch (error) {
        throw error;
      }
    },
  },

  Post: {
    author: async (post: any) => {
      return post.author;
    },
  },
};
