const userModel = require("../models/user");
const mongoose = require("mongoose");

//Список всех пользователей
module.exports.getUser = (req, res) => {
  return userModel.find({})
  .then(r => {
    return res.status(200).send(r);
})
.catch((e) => {
    return res.status(500).send({message: "Ошибка по умолчанию"});
});
};

//Найти пользователя по id
module.exports.getUserById = (req, res) => {

  //const { id } = req.user._id;
 // console.log(id);
  return userModel.findById(req.user._id)
  .then(r => {
    if (r === null) {
        return res.status(404).send({ message: " Пользователь по указанному _id не найден" });
    }
    return res.status(200).send(r);
})
.catch((e) => {
    if (e.name === "CastError") {
        return res.status(400).send({ message: "Некорректный _id" });
    }
    return res.status(500).send({message: "Ошибка по умолчанию"});
});
};

//Создаёт пользователя
module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar,
  } = req.body;
  return userModel.create({ name, about, avatar})

  .then(r => {
    return res.status(201).send(r);
})
.catch((e) => {
     console.log(e.name);
    if (e instanceof mongoose.Error.ValidationError) {
        res.status(400).send({ message: "Переданы некорректные данные при создании пользователя" });
        return next();
    }
    return res.status(500).send({message: "Ошибка по умолчанию"});
});
};

//Обновить профиль
module.exports.updateUser = (req, res) => {
  const { name, about } = req.body;

  return userModel.findByIdAndUpdate(req.user._id,{ name, about },{new: true})

    .then(r => {
    return res.status(201).send(r);
})
    .catch((e) => {
      if (e.name === 'CastError') {
        return res.status(400).send({ message: " Переданы некорректные данные при обновлении профиля" });

      } return res.status(500).send({message: "Ошибка по умолчанию"});
    });
};

//Обновить аватар
module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;

  return userModel.findByIdAndUpdate(req.user._id,{ avatar},{new: true})

  .then(r => {
    return res.status(201).send(r);
})
    .catch((e) => {
      if (e.name === 'CastError') {
        return res.status(400).send({ message: " Переданы некорректные данные при обновлении аватара" });

      } return res.status(500).send({message: "Ошибка по умолчанию"});
    });
};
