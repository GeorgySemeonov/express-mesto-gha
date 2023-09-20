const { getUser, getUserById, updateUser, updateAvatar } = require("../controllers/users");
const router = require("express").Router();
const { celebrate, Joi } = require('celebrate');
const { regexp } = require('../utils/regexp')

router.get("/users", getUser);
router.get("/users/me",celebrate({
  params: Joi.object().keys({
    userId: Joi.string().length(24).hex().required(),
  }),
}), getUserById);
// router.post("/users", createUser);
router.patch("/users/me",
celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }),
}),updateUser);
router.patch("/users/me/avatar",
celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().regex(regexp),
  }),
}),
updateAvatar);



// router.post("/signin", login);
// router.post('/signup', createUser);

module.exports = router;

