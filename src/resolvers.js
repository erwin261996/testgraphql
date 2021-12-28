const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { authenticated, authorized, APP_SECRET } = require("./auth")
const {constants} = require("./constants")
// const { Op } = require("sequelize")

module.exports = {
  resolvers: {
    // Error
    User: {
      error() {
        return 'Hola Mundo'
        // throw new Error("nooo")
      }
    },
    // Querys
    Query: {
      hello: () => 'Hello World 2', 
      /*users: authenticated(async (root, args, { models }) => {        
        return await models.User.findAll();
      }),*/
      users: (async (root, args, { models }) => {        
        return await models.User.findAll();
      }),
      allusers: async (root, args, { models }) => {
        return await models.User.findAll();
      }
    },
    // Mutations
    Mutation: {
      signup: async (root, { firstName,lastName,email,password,userName,role }, { models }) => {
        try {
          return models.User.create({
            firstName,
            lastName,
            email,
            password: await bcrypt.hash(password, 10),
            userName,
            role,
            token: ''
          })
        } catch (error) {
          throw new Error("Error in the questions")
        }
      },      
      signin: async (root, { email, password }, { models, createToken }) => {
        try {          
          const dbUsers = await models.User.findAll({ where: { email: email } });          
          if (!dbUsers) {
            throw new Error("No such user found")
          }

          const valid = await bcrypt.compare(password, dbUsers[0].password);
          if (!valid) {
            throw new Error("Invalid password")
          }

          const token = createToken({ userId: dbUsers[0].id, email, role: dbUsers[0].role });

          models.User.update({ token: token }, {
            where: { id: dbUsers[0].id }
          });
                    
          return { user: dbUsers[0], token }
        } catch (error) {
          throw new Error(error)
        }
      },
      createitem: async (_, {task}, {models, pubsub}) => {
        try {
          
          const newTask = models.Task.create({
            taskName: task
          })

          console.log(pubsub)

          pubsub.publish(constants.NEW_TASK, newTask);
          return newTask;

        } catch (error) {
          throw new Error(error);
        }
      }
    },

    // Subscription
    Subscription: {
      newTask: {
        suscribe: async (parent, args, context) => {
          return context.pubsub.asyncIterator(constants.NEW_TASK)
        },
        resolve: payload => { return payload }
      }
    }
  }
}