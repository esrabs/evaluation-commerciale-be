const router = require("express").Router();
const { Vente, Users, Squad } = require("../models");

const auth = require("../middleware/auth");
const role = require("../middleware/role");

router.use(auth);

/**
 * POST /ventes
 * COMMERCIAL: créer une vente pour lui-même
 * Body: { dateVente: "YYYY-MM-DD", montant: 123.45 }
 */
router.post("/", role("COMMERCIAL"), async (req, res) => {
  try {
    const { dateVente, montant } = req.body;

    if (!dateVente || montant === undefined) {
      return res.status(400).json({ error: "dateVente et montant requis" });
    }

    const vente = await Vente.create({
      dateVente,
      montant,
      idCommercial: req.user.id, // 🔥 vient du token
    });

    res.status(201).json(vente);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/**
 * GET /ventes/me
 * COMMERCIAL: voir ses ventes
 * Query optionnelle: ?from=YYYY-MM-DD&to=YYYY-MM-DD
 */
router.get("/me", role("COMMERCIAL"), async (req, res) => {
  try {
    const { from, to } = req.query;

    const where = { idCommercial: req.user.id };
    if (from && to) {
      where.dateVente = { ["between"]: [from, to] }; // (on corrige juste après)
    }

    // 👉 version safe sans opérateurs Sequelize (simple) :
    const ventes = await Vente.findAll({
      where: { idCommercial: req.user.id },
      order: [["dateVente", "DESC"]],
    });

    res.json(ventes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/**
 * GET /ventes/squad
 * GESTIONNAIRE: voir les ventes des commerciaux de sa squad
 * Query optionnelle: ?from=YYYY-MM-DD&to=YYYY-MM-DD
 */
router.get("/squad", role("GESTIONNAIRE"), async (req, res) => {
  try {
    // trouver la squad dont ce user est le gestionnaire
    const squad = await Squad.findOne({
      where: { idGestionnaire: req.user.id },
    });

    if (!squad) {
      return res.status(404).json({ error: "Aucune squad assignée à ce gestionnaire" });
    }

    // trouver les commerciaux de cette squad
    const commerciaux = await Users.findAll({
      where: { idSquad: squad.id, role: "COMMERCIAL", actif: true },
      attributes: ["id", "nom", "prenom", "email", "idSquad"],
    });

    const ids = commerciaux.map((c) => c.id);

    // s'il n'y a personne
    if (ids.length === 0) return res.json([]);

    // récupérer les ventes
    const ventes = await Vente.findAll({
      where: { idCommercial: ids },
      include: [
        { model: Users, as: "commercial", attributes: ["id", "nom", "prenom", "email"] },
      ],
      order: [["dateVente", "DESC"]],
    });

    res.json(ventes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/**
 * GET /ventes
 * ADMIN: voir toutes les ventes
 */
router.get("/", role("ADMIN"), async (req, res) => {
  try {
    const ventes = await Vente.findAll({
      include: [
        { model: Users, as: "commercial", attributes: ["id", "nom", "prenom", "email", "idSquad"] },
      ],
      order: [["dateVente", "DESC"]],
    });
    res.json(ventes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
