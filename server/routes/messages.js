const router = require("express").Router();
const { Message, Users } = require("../models");
const auth = require("../middleware/auth");

router.use(auth);

/**
 * POST /messages
 * Envoyer un message
 * Body: { idDestinataire, titre, contenu }
 */
router.post("/", async (req, res) => {
  try {
    const { idDestinataire, titre, contenu } = req.body;

    if (!idDestinataire || !titre || !contenu) {
      return res.status(400).json({ error: "idDestinataire, titre, contenu requis" });
    }

    // vérifier destinataire
    const dest = await Users.findByPk(idDestinataire);
    if (!dest || !dest.actif) return res.status(404).json({ error: "Destinataire introuvable" });

    const msg = await Message.create({
      idExpediteur: req.user.id,
      idDestinataire,
      titre,
      contenu,
      lu: false,
    });

    res.status(201).json(msg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/**
 * GET /messages/recus
 * Voir mes messages reçus
 */
router.get("/recus", async (req, res) => {
  try {
    const msgs = await Message.findAll({
      where: { idDestinataire: req.user.id },
      include: [
        { model: Users, as: "expediteur", attributes: ["id", "nom", "prenom", "email", "role"] },
      ],
      order: [["dateEnvoi", "DESC"]],
    });

    res.json(msgs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/**
 * GET /messages/envoyes
 * Voir mes messages envoyés
 */
router.get("/envoyes", async (req, res) => {
  try {
    const msgs = await Message.findAll({
      where: { idExpediteur: req.user.id },
      include: [
        { model: Users, as: "destinataire", attributes: ["id", "nom", "prenom", "email", "role"] },
      ],
      order: [["dateEnvoi", "DESC"]],
    });

    res.json(msgs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/**
 * PUT /messages/:id/lu
 * Marquer comme lu (seulement le destinataire)
 */
router.put("/:id/lu", async (req, res) => {
  try {
    const msg = await Message.findByPk(req.params.id);
    if (!msg) return res.status(404).json({ error: "Message introuvable" });

    // sécurité : seul le destinataire peut marquer lu
    if (msg.idDestinataire !== req.user.id) {
      return res.status(403).json({ error: "Accès interdit" });
    }

    msg.lu = true;
    await msg.save();

    res.json({ ok: true, message: "Message marqué comme lu", id: msg.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/**
 * GET /messages/:id
 * Lire un message (expéditeur ou destinataire)
 */
router.get("/:id", async (req, res) => {
  try {
    const msg = await Message.findByPk(req.params.id, {
      include: [
        { model: Users, as: "expediteur", attributes: ["id", "nom", "prenom", "email", "role"] },
        { model: Users, as: "destinataire", attributes: ["id", "nom", "prenom", "email", "role"] },
      ],
    });

    if (!msg) return res.status(404).json({ error: "Message introuvable" });

    const isOwner = msg.idExpediteur === req.user.id || msg.idDestinataire === req.user.id;
    if (!isOwner) return res.status(403).json({ error: "Accès interdit" });

    res.json(msg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
