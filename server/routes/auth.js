const router = require("express").Router();
const asyncHandler = require("../middleware/asyncHandler");

const validate = require("../validators/validate");
const { loginValidator } = require("../validators/authValidators");

const authController = require("../controllers/authController");

router.post("/login", loginValidator, validate, asyncHandler(authController.login));

module.exports = router;
