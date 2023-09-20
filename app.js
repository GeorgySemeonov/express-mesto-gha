const express = require ('express');
const mongoose = require('mongoose');
const { HTTP_STATUS_NOT_FOUND } = require('http2').constants;
const CardsRouter = require('./routes/cards');
const UserRouter = require('./routes/users');
const {login, createUser} = require("./controllers/users");
const { errors } = require('celebrate');

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

app.get('/', (req, res) =>{
  res.status(200).send('Hello!');
})


  app.use(express.json());

  app.post('/signin', login);
  app.post('/signup', createUser);

  app.use(auth);
  app.use(CardsRouter);
  app.use(UserRouter);
  app.use('/*', (req, res) => {
    res.status(HTTP_STATUS_NOT_FOUND).send({message: "Страница не найдена"});
  }) ;

  app.use((err, req, res, next) => {
    const { statusCode = 500, message } = err;
    res.status(statusCode).send(
      {message: statusCode === 500 ? 'На сервере произошла ошибка' : message,
  });
  console.log(message)
  });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});