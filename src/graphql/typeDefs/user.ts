import { gql } from 'graphql-tag';

export const userTypeDefs = gql`
  type User {
    _id: ID!
    username: String!
    email: String!
    firstName: String
    lastName: String
    fullName: String
    gender: String
    role: String!
    provider: String!
    phoneNumber: String
    profilePicture: String
    profileCoverPicture: String
    isVerified: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    getUser(id: ID!): User
    getCurrentUser: User
    getUserByEmail(email: String!): User
  }

  type Mutation {
    updateUserProfile(
      firstName: String
      lastName: String
      phoneNumber: String
      gender: String
    ): User
    uploadProfilePicture(key: String!): User
    uploadCoverPicture(key: String!): User
  }
`;
