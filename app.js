const express = require ('express');
const mongoose = require('mongoose');
const { HTTP_STATUS_NOT_FOUND } = require('http2').constants;
const CardsRouter = require('./routes/cards');
const UserRouter = require('./routes/users');
const {login, createUser} = require("./controllers/users");

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
// app.use((req, res, next) => {
//   req.user = {
//     _id: '64f8ac8821a3a948bb0cc584' // вставьте сюда _id созданного в предыдущем пункте пользователя
//   };

//   next();
// });
  app.use(auth);
  app.use(express.json());
  app.use(CardsRouter);
  app.use(UserRouter);
  app.post('/signin', login);
  app.post('/signup', createUser);

  app.use('/*', (req, res) => {
    res.status(HTTP_STATUS_NOT_FOUND).send({message: "Страница не найдена"});
  }) ;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});