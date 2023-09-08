const express = require ('express');
const mongoose = require('mongoose');

const CardsRouter = require('./routes/cards');
const UserRouter = require('./routes/users');

const app = express();
const port = 3000;

mongoose.connect('mongodb://127.0.0.1:27017/mestodb')
  .then(() => {
    console.log('Connected to DB');
  })
  .catch(() => {
    console.log('No connection to DB');
  });


app.get('/',(req , res) =>{
  res.status(200).send('Hello!');
})
app.use((req, res, next) => {
  req.user = {
    _id: '64f8ac8821a3a948bb0cc584' // вставьте сюда _id созданного в предыдущем пункте пользователя
  };

  next();
});

  app.use(express.json());
  app.use(CardsRouter);
  app.use(UserRouter);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});