const userModel = require("../models/user");
const mongoose = require("mongoose");
const { HTTP_STATUS_BAD_REQUEST, HTTP_STATUS_OK, HTTP_STATUS_CREATED, HTTP_STATUS_INTERNAL_SERVER_ERROR, HTTP_STATUS_NOT_FOUND } = require('http2').constants;

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
    if (user === null) {
      return res.status(HTTP_STATUS_NOT_FOUND).send({ message: " Пользователь по указанному _id не найден" });
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

// module.exports.getUserById = (req , res) => {
//   const { userID } = req.params;
//   console.log(req.params);
//   return userModel.findById(userID)
//       .then(r => {
//           if (r === null) {
//               return res.status(404).send({ message: "User not found" });
//           }
//           return res.status(200).send(r);
//       })
//       .catch((e) => {
//           if (e.name === "CastError") {
//               return res.status(400).send({ message: "Invalid ID" });
//           }
//           return res.status(500).send({message: "Server Error"});
//       });
// }

//Создаёт пользователя
module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar,
  } = req.body;
  return userModel.create({ name, about, avatar})

  .then(user => {
    return res.status(HTTP_STATUS_CREATED).send(user);
})
.catch((e) => {
     console.log(e.name);
    if (e instanceof mongoose.Error.ValidationError) {
        res.status(HTTP_STATUS_BAD_REQUEST).send({ message: "Переданы некорректные данные при создании пользователя" });
        return next();
    }
    return res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({message: "Ошибка по умолчанию"});
});
};

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
