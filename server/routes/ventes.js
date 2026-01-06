const router = require("express").Router();

const auth = require("../middleware/auth");
const role = require("../middleware/role");
const asyncHandler = require("../middleware/asyncHandler");

const validate = require("../validators/validate");
const {
  createVenteValidator,
  dateFilterValidator,
} = require("../validators/ventesValidators");

const ventesController = require("../controllers/ventesController");

router.use(auth);

// POST /ventes
router.post(
  "/",
  role("COMMERCIAL"),
  createVenteValidator,
  validate,
  asyncHandler(ventesController.createVente)
);

// GET /ventes/me
router.get(
  "/me",
  role("COMMERCIAL"),
  dateFilterValidator,
  validate,
  asyncHandler(ventesController.getMyVentes)
);

// GET /ventes/squad
router.get(
  "/squad",
  role("GESTIONNAIRE"),
  dateFilterValidator,
  validate,
  asyncHandler(ventesController.getSquadVentes)
);

// GET /ventes
router.get("/", role("ADMIN"), asyncHandler(ventesController.getAllVentes));

module.exports = router;
