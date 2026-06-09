import { gql } from 'graphql-tag';

export const postTypeDefs = gql`
  type Post {
    _id: ID!
    content: String!
    author: User!
    createdAt: String!
    updatedAt: String!
    likes: Int
    comments: Int
  }

  type Query {
    getPost(id: ID!): Post
    getAllPosts(limit: Int, offset: Int): [Post]!
    getUserPosts(userId: ID!, limit: Int, offset: Int): [Post]!
  }

  type Mutation {
    createPost(content: String!): Post
    updatePost(id: ID!, content: String!): Post
    deletePost(id: ID!): Boolean
  }
`;
