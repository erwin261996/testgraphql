const jwt = require("jsonwebtoken");
const models = require("../models");
const APP_SECRET = "sdkjl324k2lj342l3uiowueir";

const createToken = ({ userId, email, role }) => jwt.sign({ userId, email, role }, APP_SECRET, { expiresIn: '2h' });

const getUserId = (token) => {
  try {
    const user = jwt.verify(token, APP_SECRET);
    return models.User.findAll({ where: { id: user.userId } });
  } catch (error) {
    return null
  }
}

const authenticated = next => (root, args, context, info) => {
  if (!context.user) {
    throw new Error("not authorized");
  }
  return next(root, args, context, info)
}

const authorized = (role, next) => (root, args, context, info) => {
  if (context.user.role !== role) {
    throw new Error(`Must by a ${role}`)
  }

  return next(root, args, context, info)
}

module.exports = {
  APP_SECRET,
  getUserId,
  createToken,
  authenticated,
  authorized
}