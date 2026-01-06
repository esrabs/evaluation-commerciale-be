const router = require("express").Router();

const auth = require("../middleware/auth");
const role = require("../middleware/role");
const asyncHandler = require("../middleware/asyncHandler");

const validate = require("../validators/validate");
const {
  sendMessageValidator,
  messageIdParamValidator,
} = require("../validators/messagesValidators");

const messagesController = require("../controllers/messagesController");

router.use(auth);

/**
 * POST /messages
 * Envoyer un message
 */
router.post(
  "/",
  role("COMMERCIAL", "GESTIONNAIRE", "ADMIN"),
  sendMessageValidator,
  validate,
  asyncHandler(messagesController.sendMessage)
);

/**
 * GET /messages/recus
 * Voir mes messages reçus
 */
router.get(
  "/recus",
  asyncHandler(messagesController.getRecus)
);

/**
 * GET /messages/envoyes
 * Voir mes messages envoyés
 */
router.get(
  "/envoyes",
  asyncHandler(messagesController.getEnvoyes)
);

/**
 * PUT /messages/:id/lu
 * Marquer comme lu
 */
router.put(
  "/:id/lu",
  role("COMMERCIAL", "GESTIONNAIRE", "ADMIN"),
  messageIdParamValidator,
  validate,
  asyncHandler(messagesController.markAsRead)
);

/**
 * GET /messages/:id
 * Lire un message
 */
router.get(
  "/:id",
  asyncHandler(messagesController.getById)
);

module.exports = router;
