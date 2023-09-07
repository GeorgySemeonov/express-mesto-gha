const cardModel = require('../models/card');
const mongoose = require("mongoose");

//Все карточки
module.exports.getCard = (req, res) => {
  return cardModel.find({})
  .then(r => {
    return res.status(200).send(r);
})
.catch((e) => {
    return res.status(500).send({message: "Ошибка по умолчанию."});
});
};

//Создать карточку
module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  //const { id } = req.user._id;

  return cardModel.create({ name, link })
  .then(r => {
    return res.status(201).send(r);
})
.catch((e) => {
     console.log(e.name);
    if (e instanceof mongoose.Error.ValidationError) {
        res.status(400).send({ message: "Переданы некорректные данные при создании карточки" });
        return next();
    }
    return res.status(500).send({message: "Ошибка по умолчанию."});
});
};

//Удалить карточку
module.exports.deleteCard = (req, res) => {
  const { cardId } = req.params;
  //const { id } = req.user._id;
  console.log(cardId);
  return cardModel.findByIdAndDelete(cardId)
  .then(r => {
    if (r === null) {
        return res.status(404).send({ message: " Карточка с указанным _id не найдена" });
    }
    return res.status(200).send(r);
})
};

//Добавить лайк карточке
module.exports.likeCard = (req, res) => {
  const { cardId } = req.params;
  return cardModel.findByIdAndUpdate(cardId,{ $addToSet: { likes: req.user._id } },{ new: true })
  .then(r => {
    if (r === null) {
        return res.status(404).send({ message: "Передан несуществующий _id карточки" });
    }
    return res.status(200).send(r);
})
.catch((e) => {
  console.log(e.name);
    if (e.name === "CastError") {
        return res.status(400).send({ message: "Переданы некорректные данные для постановки/снятии лайка" });
    }
    return res.status(500).send({message: "Ошибка по умолчанию."});
});
};

//Удалить лайк с карточки
module.exports.dislikeCard = (req, res) => {
  const { cardId } = req.params;
  return cardModel.findByIdAndUpdate(cardId,{ $pull: { likes: req.user._id } },{ new: true })
  .then(r => {
    if (r === null) {
        return res.status(404).send({ message: "Передан несуществующий _id карточки" });
    }
    return res.status(200).send(r);
})
.catch((e) => {
  console.log(e.name);
    if (e.name === "CastError") {
        return res.status(400).send({ message: "Переданы некорректные данные для постановки/снятии лайка" });
    }
    return res.status(500).send({message: "Ошибка по умолчанию"});
});

    };