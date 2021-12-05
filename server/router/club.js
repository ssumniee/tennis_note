const express = require("express");
const router = express.Router();
const { isAuth } = require("../middlewares");
const { getAllUserInfo, modifyUserInfo } = require("../controllers/club");

router.get("/:id", isAuth, getAllUserInfo);
router.put("/:id", isAuth, modifyUserInfo);

module.exports = router;
