const { body } = require("express-validator");

exports.loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("email requis")
    .isEmail()
    .withMessage("email invalide"),
  body("motDePasse")
    .notEmpty()
    .withMessage("motDePasse requis")
    .isLength({ min: 4 })
    .withMessage("motDePasse trop court"),
];
