const { body, param } = require("express-validator");

exports.sendMessageValidator = [
  body("titre")
    .trim()
    .notEmpty()
    .withMessage("titre requis")
    .isLength({ max: 100 })
    .withMessage("titre trop long (max 100)"),
  body("contenu")
    .trim()
    .notEmpty()
    .withMessage("contenu requis")
    .isLength({ max: 1000 })
    .withMessage("contenu trop long (max 1000)"),
  body("idDestinataire")
    .notEmpty()
    .withMessage("idDestinataire requis")
    .isInt({ gt: 0 })
    .withMessage("idDestinataire doit être un entier > 0"),
];

exports.messageIdParamValidator = [
  param("id")
    .notEmpty()
    .withMessage("id requis")
    .isInt({ gt: 0 })
    .withMessage("id doit être un entier > 0"),
];
