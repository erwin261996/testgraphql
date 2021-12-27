const express = require("express")
const {
  ApolloServer,
  AuthenticationError,
  UserInputError,
  ApolloError
} = require("apollo-server-express");
const { makeExecutableSchema } = require('@graphql-tools/schema');

const { typeDefs } = require("./schema")
const { resolvers } = require("./resolvers")
const {
  UpperDirectiveTransformer,
  AuthenticatedDirective,
  AuthorizedDirective
} = require("./directives")
const models = require("../models")
const { getUserId, createToken } = require("./auth")

// Aplicando Directivas
let schema = makeExecutableSchema({ typeDefs, resolvers });
schema = UpperDirectiveTransformer(schema, 'upper');
schema = AuthenticatedDirective(schema, 'authenticated');
schema = AuthorizedDirective(schema, 'authorized');

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
  }
});  
const app = express();

server.start().then(res => {
  const PORT = 4000;
  server.applyMiddleware({ app });    
  app.listen(PORT, () => {
    console.log(`🚀 Server is running at ${ PORT }`)
  })
});

// ----------------------------------
