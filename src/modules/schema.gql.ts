import { 
    GraphQLList, 
    GraphQLNonNull, 
    GraphQLObjectType, 
    GraphQLSchema, 
    GraphQLString 
} from "graphql";

const UserType = new GraphQLObjectType({
    name: "User",
    fields: {
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: GraphQLString },
        phone: { type: GraphQLString },
        profilePicture: { type: new GraphQLList(GraphQLString) },
    },
});

export const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: "Query", 
        fields: {
            getUser: {
                type: UserType, 
                args: {
                    userID: { type: new GraphQLNonNull(GraphQLString) },
                },
                resolve: async (parent, args, context) => {
                    return await context.userService.getUserByID(args.userID);
                }
            }
        }
    }),

    mutation: new GraphQLObjectType({
        name: "Mutation", 
        fields: {
            createUser: {
                type: UserType,
                args: {
                    firstName: { type: new GraphQLNonNull(GraphQLString) },
                    email: { type: GraphQLString },
                    phone: { type: GraphQLString },
                    profilePicture: { type: new GraphQLList(GraphQLString) },
                },
                resolve: async (parent, args, context) => {
                    return await context.userService.createUser(args);
                }
            }
        }
    })
});