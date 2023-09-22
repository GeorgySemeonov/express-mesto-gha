const bcrypt = require('bcrypt');
// const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');

const userModel = require('../models/user');
// const user = require('../models/user');
const JWT_SECRET = '123456789123456789';
const {
  HTTP_STATUS_OK,
  HTTP_STATUS_CREATED,
  // eslint-disable-next-line import/order
} = require('http2').constants;

const BadRequestError = require('../errors/BadRequestError');
const UnauthorizedError = require('../errors/UnauthorizedError');
const NotFoundError = require('../errors/NotFoundError');
const ConflictError = require('../errors/ConflictError');

const SALT_ROUNDS = 10;

// Список всех пользователей
module.exports.getUsers = (req, res, next) => {
  userModel
    .find({})
    .then((user) => res.send(user))
    .catch(next);
};

// module.exports.getUsers = (req, res) => {
//   return userModel.find({})
//   .then(user => {
//     return res.status(HTTP_STATUS_OK).send(user);
// })
// .catch((e) => {
//     return res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({message: "Ошибка по умолчанию"});
// });
// };

// Найти текущего пользователя
module.exports.getUser = (req, res, next) => {
  // const id = req.user._id;
  const id = req.user._id;
  console.log(id);
  console.log(req.user);
  userModel
    .findById(id)
    .orFail()
    .then((user) => res.status(HTTP_STATUS_OK).send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(
          new BadRequestError(
            'Некорректные данные при поиске пользователя по _id',
          ),
        );
      } else if (err.name === 'DocumentNotFoundError') {
        next(new NotFoundError('Пользователь по указанному id не найден'));
      } else {
        next(err);
      }
    });
};

// Найти пользователя по id
module.exports.getUserById = (req, res, next) => {
  // const  {id}  = req.user._id;
  const { id } = req.params;
  // const { id } = req.user;
  console.log(id);
  userModel
    .findById(id)
    .orFail()
    .then((user) => res.status(HTTP_STATUS_OK).send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(
          new BadRequestError(
            'Некорректные данные при поиске пользователя по _id',
          ),
        );
      } else if (err.name === 'DocumentNotFoundError') {
        next(new NotFoundError('Пользователь по указанному id не найден'));
      } else {
        next(err);
      }
    });
};
//     if (!user) {
//       return res.status(HTTP_STATUS_NOT_FOUND).send({ message: " Пользователь не найден" });
//   }

//   return res.status(HTTP_STATUS_OK).send(user);
// })
// .catch((err) => {
//   if (err.name === "CastError") {
//     return res.status(HTTP_STATUS_BAD_REQUEST).send({ message: "Некорректный _id" });
// }
// return res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({message: "Ошибка по умолчанию"});

// });
// };

// Регистрируем пользователя
module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  bcrypt
    .hash(password, SALT_ROUNDS)
    .then((hash) => userModel.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))

    .then((user) =>
      // const { id } = user;
      // eslint-disable-next-line implicit-arrow-linebreak
      res.status(HTTP_STATUS_CREATED).send({
        name: user.name,
        about: user.about,
        avatar: user.avatar,
        email: user.email,
      }))
    .catch((e) => {
      console.log(e.name);
      if (e.code === 11000) {
        next(new ConflictError('Такой пользователь уже существует'));
      } else if (e.name === 'ValidationError') {
        next(
          new BadRequestError(
            'Переданы некорректные данные при создании пользователя',
          ),
        );
      } else {
        next(e);
      }
    });
};
//       res.status(CONFLICT).send({ message: "Такой пользователь уже существует" });
//     } else if (e instanceof mongoose.Error.ValidationError) {
// eslint-disable-next-line max-len
//       res.status(HTTP_STATUS_BAD_REQUEST).send({ message: "Переданы некорректные данные при создании пользователя" });
//        // return next();
//     }
//     return res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({message: "Ошибка по умолчанию"});
// });
// };

// login
module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return userModel
    .findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError('Неверный логин или пароль');
        // return res.status(FORBIDDEN).send({ message: "Неверный логин" });
      }
      bcrypt.compare(password, user.password, (err, isValid) => {
        if (!isValid) {
          return next(new UnauthorizedError('Неверный логин или пароль'));
          // return res.status(UNAUTHORIZED).send({ message: "Неверный пароль" });
        }

        const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
          expiresIn: '7d',
        });
        console.log(user._id);
        return res.status(HTTP_STATUS_OK).send({ token });
      });
    })
    .catch(next);
};

// Обновить профиль
module.exports.updateUser = (req, res, next) => {
  const { name, about } = req.body;

  userModel
    .findByIdAndUpdate(
      req.user._id,
      { name, about },
      { new: true, runValidators: true },
    )

    .orFail()
    .then((user) => res.send({ user }))
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        next(
          new BadRequestError(
            'Переданы некорректные данные при обновлении профиля',
          ),
        );
      } else if (err.name === 'DocumentNotFoundError') {
        next(new NotFoundError('Пользователь с указанным _id не найден'));
      } else {
        next(err);
      }
    });
};

// Обновить аватар
module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;

  userModel
    .findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true, runValidators: true },
    )

    .orFail()
    .then((user) => res.send({ user }))
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(
          new BadRequestError(
            'Переданы некорректные данные при обновлении аватара',
          ),
        );
      }
      if (err.name === 'DocumentNotFoundError') {
        next(new NotFoundError('Пользователь с указанным _id не найден'));
      } else {
        next(err);
      }
    });
};
