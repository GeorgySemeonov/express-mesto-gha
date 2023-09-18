const bcrypt = require('bcrypt');

const userModel = require("../models/user");
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const user = require('../models/user');
const { JWT_SECRET } = '123456789';
const { HTTP_STATUS_BAD_REQUEST, HTTP_STATUS_OK, HTTP_STATUS_CREATED, HTTP_STATUS_INTERNAL_SERVER_ERROR, HTTP_STATUS_NOT_FOUND, CONFLICT, UNAUTHORIZED, FORBIDDEN } = require('http2').constants;

const SALT_ROUNDS = 10;

//Список всех пользователей
module.exports.getUser = (req, res) => {
  return userModel.find({})
  .then(user => {
    return res.status(HTTP_STATUS_OK).send(user);
})
.catch((e) => {
    return res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({message: "Ошибка по умолчанию"});
});
};

//Найти пользователя по id
module.exports.getUserById = (req, res) => {

  const id = req.user._id;
 console.log(id);
  return userModel.findById(id)
  .then(user => {
    if (!user) {
      return res.status(HTTP_STATUS_NOT_FOUND).send({ message: " Пользователь не найден" });
  }

  return res.status(HTTP_STATUS_OK).send(user);
})
.catch((err) => {
  if (err.name === "CastError") {
    return res.status(HTTP_STATUS_BAD_REQUEST).send({ message: "Некорректный _id" });
}
return res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({message: "Ошибка по умолчанию"});

});
};

// Регистрируем пользователя
module.exports.createUser = (req, res, next) => {


  const {
    name, about, avatar, email, password,
  } = req.body;
 // return userModel.create({ name, about, avatar})
 bcrypt.hash(password, SALT_ROUNDS)
    .then((hash) => userModel.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))

  .then(user => {
    return res.status(HTTP_STATUS_CREATED).send(user);
})
.catch((e) => {
     console.log(e.name);
     if (e.code === 11000) {
      res.status(CONFLICT).send({ message: "Такой пользователь уже существует" });
    } else if (e instanceof mongoose.Error.ValidationError) {
        res.status(HTTP_STATUS_BAD_REQUEST).send({ message: "Переданы некорректные данные при создании пользователя" });
        return next();
    }
    return res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({message: "Ошибка по умолчанию"});
});
};

// login
module.exports.login = (req, res) => {
  const { email, password } = req.body;
  return userModel.findOne({ email })
  .select('+password')
    .then((user) => {
      if (!user) {
        return res.status(FORBIDDEN).send({ message: "Неверный логин " });
      }
      bcrypt.compare(password, user.password, (err, isValid) => {
        if (!isValid) {
          return res.status(UNAUTHORIZED).send({ message: "Неверный пароль" });
        }

        const token = jwt.sign(
          { _id: user._id }, JWT_SECRET, { expiresIn: '7d'},
        );
        console.log(token)
        return res.status(HTTP_STATUS_OK).send({ token });

      });
    })
    .catch(() =>{
      return res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: "Ошибка по умолчанию " });});
  }

//Обновить профиль
module.exports.updateUser = (req, res) => {
  const { name, about } = req.body;

  return userModel.findByIdAndUpdate(req.user._id,{ name, about },{new: true, runValidators: true,})

    .then(user => {
    return res.status(HTTP_STATUS_OK).send(user);
})
    .catch((e) => {
      if (e instanceof mongoose.Error.ValidationError) {

        return res.status(HTTP_STATUS_BAD_REQUEST).send({message: "Переданы некорректные данные при обновлении профиля"});
      } return res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: "Ошибка по умолчанию " });
    });
};

//Обновить аватар
module.exports.updateAvatar = (req, res ) => {
  const { avatar } = req.body;

  return userModel.findByIdAndUpdate(req.user._id,{ avatar},{new: true, runValidators: true, })

  .then(user => {
    return res.status(HTTP_STATUS_OK).send(user);
})
    .catch((e) => {
      if (e instanceof mongoose.Error.ValidationError) {
        return res.status(HTTP_STATUS_BAD_REQUEST).send({ message: " Переданы некорректные данные при обновлении аватара" });

      } return res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({message: "Ошибка по умолчанию"});
    });
};
