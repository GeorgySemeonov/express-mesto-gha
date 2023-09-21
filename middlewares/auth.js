const jwt = require('jsonwebtoken');

const JWT_SECRET = '123456789123456789';
const UnauthorizedError = require('../errors/UnauthorizedError');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Необходима авторизация'));
    // return res.status(401).send({ message: "Ошибка 1авторизации" });
  }
  const token = authorization.replace('Bearer ', '');
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return next(new UnauthorizedError('Необходима авторизация'));
    // return res.status(401).send({ message: "Ошибка 2авторизации" });
  }
  req.user = payload;
  return next();
};
