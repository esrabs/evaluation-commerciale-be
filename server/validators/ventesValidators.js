const { body, query } = require("express-validator");

exports.createVenteValidator = [
  body("dateVente")
    .notEmpty()
    .withMessage("dateVente requise")
    .isISO8601()
    .withMessage("dateVente doit être une date ISO (YYYY-MM-DD)"),
  body("montant")
    .notEmpty()
    .withMessage("montant requis")
    .isFloat({ gt: 0 })
    .withMessage("montant doit être un nombre > 0"),
];

exports.dateFilterValidator = [
  query("from")
    .optional()
    .isISO8601()
    .withMessage("from doit être une date ISO (YYYY-MM-DD)"),
  query("to")
    .optional()
    .isISO8601()
    .withMessage("to doit être une date ISO (YYYY-MM-DD)"),
];
