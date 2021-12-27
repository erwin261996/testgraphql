const { ApolloServer, gql } = require("apollo-server")

let arrUser = [
  {
    "id": 1,
    "name": "Erwin"
  },
  {
    "id": 2,
    "name": "Jefferson"
  }
]

// typeDefs
const typeDefs = gql `
  type User {
    id: ID!,
    name: String!
  }
  
  #Query
  type Query {
    users: [User!]!,
    finduser(id: ID!): [User!]!
  }

  #Mutations
  type Mutation {
    createUser(name: String!): User!
  }
`

const resolvers = {
  Query: {
    users: () => arrUser,
    finduser(_, args) {
      const { id } = args;
      return arrUser.filter(a => a.id==id)
    }
  },
  Mutation: {
    createUser(_, args) {
      const counter = arrUser.length
      let userReturn = {
        id: `${counter+1}`,
        name: args.name
      };
      arrUser.push(userReturn)
      
      return userReturn
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.listen().then(({ url })=> console.log(`Server runnning at ${url}`));