const cardModel = require("../models/card");
const mongoose = require("mongoose");
const {
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_OK,
  HTTP_STATUS_CREATED,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_NOT_FOUND,
} = require("http2").constants;

// Все карточки
module.exports.getCard = (req, res) => {
  return cardModel
    .find({})
    .then((user) => {
      return res.status(HTTP_STATUS_OK).send(user);
    })
    .catch((e) => {
      return res
        .status(HTTP_STATUS_INTERNAL_SERVER_ERROR)
        .send({ message: "Ошибка по умолчанию." });
    });
};

//Создать карточку
module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const id = req.user._id;

  return cardModel
    .create({ name, link, owner: id })
    .then((user) => {
      return res.status(HTTP_STATUS_CREATED).send(user);
    })
    .catch((e) => {
      console.log(e.name);
      if (e instanceof mongoose.Error.ValidationError) {
        res.status(HTTP_STATUS_BAD_REQUEST).send({
          message: "Переданы некорректные данные при создании карточки",
        });
        return next();
      }
      return res
        .status(HTTP_STATUS_INTERNAL_SERVER_ERROR)
        .send({ message: "Ошибка по умолчанию." });
    });
};

// Удалить карточку
module.exports.deleteCard = (req, res) => {
  const { cardId } = req.params;
  const id  = req.user._id;
  console.log(cardId);

  return cardModel.findById(cardId)
    .then((user) => {
      if (user === null) {
        return res
          .status(HTTP_STATUS_NOT_FOUND)
          .send({ message: " Карточка с указанным _id не найдена" });
      }
      if (!card.owner.equals(id)) {
        return res
        .status(HTTP_STATUS_NOT_FOUND)
        .send({ message: "Вы не можете удалить карточку " });
      }
      return card.remove().then(() => res.send({ card }));

     // return res.status(HTTP_STATUS_OK).send(user);
    })
    .catch(() => {
      return res
        .status(HTTP_STATUS_INTERNAL_SERVER_ERROR)
        .send({ message: "Ошибка по умолчанию." });
    });
};

//Добавить лайк карточке
module.exports.likeCard = (req, res) => {
  const { cardId } = req.params;
  return cardModel
    .findByIdAndUpdate(
      cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true }
    )
    .then((user) => {
      if (user === null) {
        return res
          .status(HTTP_STATUS_NOT_FOUND)
          .send({ message: "Передан несуществующий _id карточки" });
      }
      return res.status(HTTP_STATUS_OK).send(user);
    })
    .catch((e) => {
      console.log(e.name);
      if (e.name === "CastError") {
        return res.status(HTTP_STATUS_BAD_REQUEST).send({
          message: "Переданы некорректные данные для постановки/снятии лайка",
        });
      }
      return res
        .status(HTTP_STATUS_INTERNAL_SERVER_ERROR)
        .send({ message: "Ошибка по умолчанию." });
    });
};

//Удалить лайк с карточки
module.exports.dislikeCard = (req, res) => {
  const { cardId } = req.params;
  return cardModel
    .findByIdAndUpdate(
      cardId,
      { $pull: { likes: req.user._id } },
      { new: true }
    )
    .then((user) => {
      if (user === null) {
        return res
          .status(HTTP_STATUS_NOT_FOUND)
          .send({ message: "Передан несуществующий _id карточки" });
      }
      return res.status(HTTP_STATUS_OK).send(user);
    })
    .catch((e) => {
      console.log(e.name);
      if (e.name === "CastError") {
        return res.status(HTTP_STATUS_BAD_REQUEST).send({
          message: "Переданы некорректные данные для постановки/снятии лайка",
        });
      }
      return res
        .status(HTTP_STATUS_INTERNAL_SERVER_ERROR)
        .send({ message: "Ошибка по умолчанию" });
    });
};
