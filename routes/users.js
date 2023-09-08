const { getUser, getUserById, createUser, updateUser, updateAvatar } = require("../controllers/users");
const router = require("express").Router();

router.get("/users", getUser);
router.get("/users/:userId", getUserById);
router.post("/users", createUser);
router.patch("/users/me", updateUser);
router.patch("/users/me/avatar", updateAvatar);

module.exports = router;

