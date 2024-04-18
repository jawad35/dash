const { Magic } = require('@magic-sdk/admin');
const AppError = require('../util/appError');
const jwt = require('jsonwebtoken')

const authMiddleware = async (req, res, next) => {
  try {
    const didToken = req.headers.authorization.substring(7);
    const user = jwt.verify(didToken, '123456')
    req.user = user
    if(didToken) {
      next();
    }
  } catch (error) {
    return next(new AppError(error.message, 401));
  }
};

module.exports = authMiddleware;
