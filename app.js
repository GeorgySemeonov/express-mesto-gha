const express = require('express');
const mongoose = require('mongoose');
// const { HTTP_STATUS_NOT_FOUND } = require('http2').constants;

const { errors } = require('celebrate');
const { celebrate, Joi } = require('celebrate');
const CardsRouter = require('./routes/cards');
const UserRouter = require('./routes/users');
const { login, createUser } = require('./controllers/users');
const { regexp } = require('./utils/regexp');
const NotFoundError = require('./errors/NotFoundError');

const auth = require('./middlewares/auth');

const app = express();
const port = 3000;

mongoose.connect('mongodb://127.0.0.1:27017/mestodb')
  .then(() => {
    console.log('Connected to DB');
  })
  .catch(() => {
    console.log('No connection to DB');
  });

app.get('/', (req, res) => {
  res.status(200).send('Hello!');
});

app.use(express.json());

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().pattern(regexp),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), createUser);

app.use(auth);
app.use(CardsRouter);
app.use(UserRouter);
app.use('/*', (req, res, next) => next(new NotFoundError('Страница не найдена')));
// app.use('/*', (req, res) => {
//   res.status(HTTP_STATUS_NOT_FOUND).send({message: "Страница не найдена"});
// }) ;

app.use(errors());
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res.status(statusCode).send(
    { message: statusCode === 500 ? 'На сервере произошла ошибка' : message },
  );
  console.log(message);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
