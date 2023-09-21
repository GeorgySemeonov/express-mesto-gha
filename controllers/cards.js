const cardModel = require('../models/card');
// const mongoose = require("mongoose");
// const {
//   HTTP_STATUS_BAD_REQUEST,
//   HTTP_STATUS_OK,
//   HTTP_STATUS_CREATED,
//   HTTP_STATUS_INTERNAL_SERVER_ERROR,
//   HTTP_STATUS_NOT_FOUND,
//   FORBIDDEN,
// } = require("http2").constants;

const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');

// Все карточки
// module.exports.getCard = (req, res) => {
//   return cardModel.find({})
//     .then((user) => {
//       return res.status(HTTP_STATUS_OK).send(user);
//     })
//     .catch((e) => {
//       return res
//         .status(HTTP_STATUS_INTERNAL_SERVER_ERROR)
//         .send({ message: "Ошибка по умолчанию." });
//     });
// };

module.exports.getCard = (req, res, next) => {
  cardModel.find({})
    .then((cards) => res.send(cards))
    .catch(next);
};

// Создать карточку
// module.exports.createCard = (req, res, next) => {
//   const { name, link } = req.body;
//   const id = req.user._id;

//   return cardModel
//     .create({ name, link, owner: id })
//     .then((user) => {
//       return res.status(HTTP_STATUS_CREATED).send(user);
//     })
//     .catch((e) => {
//       console.log(e.name);
//       if (e instanceof mongoose.Error.ValidationError) {
//         res.status(HTTP_STATUS_BAD_REQUEST).send({
//           message: "Переданы некорректные данные при создании карточки",
//         });

//       }
//       return res
//         .status(HTTP_STATUS_INTERNAL_SERVER_ERROR)
//         .send({ message: "Ошибка по умолчанию." });
//     });
// };

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const id = req.user._id;
  // console.log(id);
  cardModel.create({ name, link, owner: id })
    .then((card) => {
      res.send(card);
    })
    .catch((err) => {
      if (
        res.status(err.name === 'CastError' || err.name === 'ValidationError')
      ) {
        next(new BadRequestError(
          `Переданы некорректные данные при создании карточки ${err.name}.`,
        ));
      } else {
        next(err);
      }
    });
};

// Удалить карточку
// module.exports.deleteCard = (req, res) => {
//   const { cardId } = req.params;
//   const id  = req.user._id;
//   console.log(cardId);

//   return cardModel.findById(cardId)
//     .then((card) => {
//       if (card === null) {
//         return res
//           .status(HTTP_STATUS_NOT_FOUND)
//           .send({ message: " Карточка с указанным _id не найдена" });
//       }
//       if (!card.owner.equals(id)) {
//         return res
//         .status(FORBIDDEN)
//         .send({ message: "Вы не можете удалить карточку " });
//       }
//       return card.remove().then(() => res.send({ card }));

//      // return res.status(HTTP_STATUS_OK).send(card);
//     })
//     .catch(() => {
//       return res
//         .status(HTTP_STATUS_INTERNAL_SERVER_ERROR)
//         .send({ message: "Ошибка по умолчанию." });
//     });
// };

module.exports.deleteCard = (req, res, next) => {
  const { cardId } = req.params;
  const id = req.user._id;

  cardModel.findById(cardId)
    .orFail()
    .then((card) => {
      const { owner: cardOwnerId } = card;
      if (cardOwnerId.valueOf() !== id) {
        throw new ForbiddenError('Вы не можете удалить эту карточку.');
      } return cardModel.findByIdAndDelete(cardId);
    })
    .then((deletedCard) => {
      res.send(deletedCard);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError(
          'Переданы некорректные данные карточки.',
        ));
      } else if (err.name === 'DocumentNotFoundError') {
        next(new NotFoundError(
          'Передан несуществующий _id карточки.',
        ));
      } else {
        next(err);
      }
    });
};

// Добавить лайк карточке
module.exports.likeCard = (req, res, next) => {
  const { cardId } = req.params;
  cardModel
    .findByIdAndUpdate(
      cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    )
    .orFail()
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError(
          'Переданы некорректные данные для постановки/снятии лайка.',
        ));
      } else if (err.name === 'DocumentNotFoundError') {
        next(new NotFoundError('Передан несуществующий _id карточки.'));
      } else {
        next(err);
      }
    });
  // .then((card) => {
  //   if (card === null) {
  //     return res
  //       .status(HTTP_STATUS_NOT_FOUND)
  //       .send({ message: "Передан несуществующий _id карточки" });
  //   }
  //   return res.status(HTTP_STATUS_OK).send(card);
  // })
  // .catch((e) => {
  //   console.log(e.name);
  //   if (e.name === "CastError") {
  //     return res.status(HTTP_STATUS_BAD_REQUEST).send({
  //       message: "Переданы некорректные данные для постановки/снятии лайка",
  //     });
  //   }
  //   return res
  //     .status(HTTP_STATUS_INTERNAL_SERVER_ERROR)
  //     .send({ message: "Ошибка по умолчанию." });
  // });
};

// Удалить лайк с карточки
module.exports.dislikeCard = (req, res, next) => {
  const { cardId } = req.params;
  cardModel
    .findByIdAndUpdate(
      cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    )
    .orFail()
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError(
          'Переданы некорректные данные для постановки/снятии лайка.',
        ));
      } else if (err.name === 'DocumentNotFoundError') {
        next(new NotFoundError('Передан несуществующий _id карточки.'));
      } else {
        next(err);
      }
    });

  // const { cardId } = req.params;
  // return cardModel
  //   .findByIdAndUpdate(
  //     cardId,
  //     { $pull: { likes: req.user._id } },
  //     { new: true }
  //   )
  //   .then((card) => {
  //     if (card === null) {
  //       return res
  //         .status(HTTP_STATUS_NOT_FOUND)
  //         .send({ message: "Передан несуществующий _id карточки" });
  //     }
  //     return res.status(HTTP_STATUS_OK).send(card);
  //   })
  //   .catch((e) => {
  //     console.log(e.name);
  //     if (e.name === "CastError") {
  //       return res.status(HTTP_STATUS_BAD_REQUEST).send({
  //         message: "Переданы некорректные данные для постановки/снятии лайка",
  //       });
  //     }
  //     return res
  //       .status(HTTP_STATUS_INTERNAL_SERVER_ERROR)
  //       .send({ message: "Ошибка по умолчанию" });
  //   });
};
