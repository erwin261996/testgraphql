const { gql } = require("apollo-server-express");

const typeDefs = gql `
  # Definition
  directive @log on FIELD_DEFINITION
  directive @upper on FIELD_DEFINITION

  directive @authenticated on FIELD_DEFINITION
  directive @authorized(role: Role!= ADMIN) on FIELD_DEFINITION

  enum Role {
    ADMIN
    GUEST
  }

  type AutoPayLoad {
    token: String,
    user: User
  }

  type User {
    id: ID! @log,
    error: String! @deprecated,
    firstName: String! @upper,
    lastName: String!,
    email: String!,
    password: String!,
    userName: String!
    createdAt: String,
    updatedAt: String
  }

  #Query
  type Query {
    hello: String!,
    users: [User!]! @authenticated,
    allusers: [User!]! @authenticated @authorized(role: ADMIN)
  }

  #Mutation
  type Mutation {
    signup(firstName: String!, lastName: String!,
               email: String!, password:String!, userName:String!, role: String!): User!,               
    signin(email: String!, password: String!): AutoPayLoad
  }
`;

module.exports = {
  typeDefs 
}