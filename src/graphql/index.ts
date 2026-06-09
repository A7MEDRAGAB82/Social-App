import { buildSchema, GraphQLError } from 'graphql';
import { graphql } from 'graphql';
import { typeDefs } from './typeDefs';
import { resolvers } from './resolvers';
import { buildGraphQLContext, GraphQLContext } from './context';
import { Express, Request, Response } from 'express';
import { env } from '../config/env.service';

function getSchemaString(typeDefs: any[]): string {
  return typeDefs
    .map((typeDef: any) => {
      if (typeDef.loc && typeDef.loc.source) {
        return typeDef.loc.source.body;
      }
      return String(typeDef);
    })
    .join('\n');
}

const schemaString = getSchemaString(typeDefs);
const schema = buildSchema(schemaString);

const rootValue: any = {};
resolvers.forEach((resolver: any) => {
  if (resolver.Query) {
    rootValue.Query = rootValue.Query || {};
    Object.assign(rootValue.Query, resolver.Query);
  }
  if (resolver.Mutation) {
    rootValue.Mutation = rootValue.Mutation || {};
    Object.assign(rootValue.Mutation, resolver.Mutation);
  }
  Object.keys(resolver).forEach((key) => {
    if (key !== 'Query' && key !== 'Mutation') {
      if (!rootValue[key]) {
        rootValue[key] = {};
      }
      Object.assign(rootValue[key], resolver[key]);
    }
  });
});

export const initializeGraphQL = (app: Express) => {
  app.post('/graphql', async (req: Request, res: Response) => {
    try {
      const context = await buildGraphQLContext(req);
      const { query, variables, operationName } = req.body;

      const result = await graphql({
        schema,
        source: query,
        rootValue,
        variableValues: variables,
        operationName,
        contextValue: context,
      });

      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        errors: [{ message: error.message }],
      });
    }
  });

  app.get('/graphql', (req: Request, res: Response) => {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>GraphQL Playground</title>
        <meta charset=utf-8/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/graphql-playground-react/build/static/css/index.css"/>
        <link rel="shortcut icon" href="//cdn.jsdelivr.net/npm/graphql-playground-react/build/favicon.png"/>
        <script src="//cdn.jsdelivr.net/npm/graphql-playground-react/build/static/js/middleware.js"></script>
      </head>
      <body>
        <div id="root"></div>
        <script>
          window.addEventListener('load', function (event) {
            GraphQLPlayground.init(document.getElementById('root'), {
              endpoint: '/graphql',
            })
          })
        </script>
      </body>
      </html>
    `);
  });

  console.log(`GraphQL server ready at http://localhost:${env.port}/graphql`);
};
