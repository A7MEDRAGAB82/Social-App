import { gql } from 'graphql-tag';
import { userTypeDefs } from './user';
import { postTypeDefs } from './post';

const rootTypeDefs = gql`
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

export const typeDefs = [rootTypeDefs, userTypeDefs, postTypeDefs];
