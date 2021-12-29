// Imported
const {createServer} = require('http');
const express = require("express")
const {execute, subscribe} = require("graphql")
const { ApolloServer } = require("apollo-server-express");
const { makeExecutableSchema } = require('@graphql-tools/schema');

const { SubscriptionServer } = require('subscriptions-transport-ws');

// imported Function Local
const { typeDefs } = require("./schema")
const { resolvers } = require("./resolvers")

const {
  UpperDirectiveTransformer,
  AuthenticatedDirective,
  AuthorizedDirective
} = require("./directives")
const models = require("../models")
const { getUserId, createToken } = require("./auth")

// Instance
const app = express();
const httpServer = createServer(app);


// Aplicando Directivas
let schema = makeExecutableSchema({ typeDefs, resolvers });
schema = UpperDirectiveTransformer(schema, 'upper');
schema = AuthenticatedDirective(schema, 'authenticated');
schema = AuthorizedDirective(schema, 'authorized');

// Creating a Subscriptions Server
const subscriptionServer = SubscriptionServer.create({
  schema,
  execute,
  subscribe,
  async onConnect({connection}) {
    // If an object is returned here, it will be passed as the `context`
    // argument to your subscription resolvers.
    return { ...connection, models, createToken}
  }
}, {
  // This is the `httpServer` we created in a previous step.
  server: httpServer,
  // This `server` is the instance returned from `new ApolloServer`.
  path: '/graphql',
})

// Ejecutando el servidor con Directivas
const server = new ApolloServer({
  schema,
  /*formatError(e) {
    console.log(e)
    return new Error("wrong fields")
  },*/
  context ({ req }) {
    const token = req.headers.authorization || '';
    const user = getUserId(token);
    return {...req, models, user, createToken}
  },
  plugins: [{
    async serverWillStart() {
      return {
        async drainServer() {
          subscriptionServer.close();
        }
      }
    }
  }]
});

server.start().then(res => {
  const PORT = 4000;
  server.applyMiddleware({ app });

  httpServer.listen(PORT, () => {
    console.log(`Server ready at ${PORT}`);
  })
});

// ----------------------------------
