const router = require("express").Router();
const { Vente, Users, Squad, Sequelize } = require("../models");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

const { Op } = Sequelize;

router.use(auth);

/**
 * Helper: construit un filtre date optionnel
 * query: ?from=YYYY-MM-DD&to=YYYY-MM-DD
 */
function buildDateWhere(from, to) {
  if (from && to) return { dateVente: { [Op.between]: [from, to] } };
  if (from) return { dateVente: { [Op.gte]: from } };
  if (to) return { dateVente: { [Op.lte]: to } };
  return {};
}

/**
 * GET /stats/me
 * COMMERCIAL: total, nb ventes, moyenne, min, max
 * Option: ?from&to
 */
router.get("/me", role("COMMERCIAL"), async (req, res) => {
  try {
    const { from, to } = req.query;

    const where = {
      idCommercial: req.user.id,
      ...buildDateWhere(from, to),
    };

    const [row] = await Vente.findAll({
      where,
      attributes: [
        [Sequelize.fn("COUNT", Sequelize.col("id")), "nbVentes"],
        [Sequelize.fn("SUM", Sequelize.col("montant")), "total"],
        [Sequelize.fn("AVG", Sequelize.col("montant")), "moyenne"],
        [Sequelize.fn("MIN", Sequelize.col("montant")), "min"],
        [Sequelize.fn("MAX", Sequelize.col("montant")), "max"],
      ],
      raw: true,
    });

    res.json({
      userId: req.user.id,
      from: from || null,
      to: to || null,
      nbVentes: Number(row.nbVentes || 0),
      total: Number(row.total || 0),
      moyenne: Number(row.moyenne || 0),
      min: Number(row.min || 0),
      max: Number(row.max || 0),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/**
 * GET /stats/squad
 * GESTIONNAIRE: total + nb ventes par commercial de sa squad
 * Option: ?from&to
 */
router.get("/squad", role("GESTIONNAIRE"), async (req, res) => {
  try {
    const { from, to } = req.query;

    // 1) trouver la squad du gestionnaire
    const squad = await Squad.findOne({ where: { idGestionnaire: req.user.id } });
    if (!squad) return res.status(404).json({ error: "Aucune squad assignée à ce gestionnaire" });

    // 2) commerciaux de la squad
    const commerciaux = await Users.findAll({
      where: { idSquad: squad.id, role: "COMMERCIAL", actif: true },
      attributes: ["id", "nom", "prenom", "email"],
      raw: true,
    });
    const ids = commerciaux.map((c) => c.id);
    if (ids.length === 0) return res.json({ squadId: squad.id, commerciaux: [], stats: [] });

    // 3) stats groupées par idCommercial
    const where = {
      idCommercial: { [Op.in]: ids },
      ...buildDateWhere(from, to),
    };

    const stats = await Vente.findAll({
      where,
      attributes: [
        "idCommercial",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "nbVentes"],
        [Sequelize.fn("SUM", Sequelize.col("montant")), "total"],
        [Sequelize.fn("AVG", Sequelize.col("montant")), "moyenne"],
      ],
      group: ["idCommercial"],
      raw: true,
    });

    // 4) “merge” stats + infos commerciaux
    const statsById = Object.fromEntries(stats.map((s) => [Number(s.idCommercial), s]));
    const result = commerciaux.map((c) => {
      const s = statsById[c.id] || { nbVentes: 0, total: 0, moyenne: 0 };
      return {
        commercial: c,
        nbVentes: Number(s.nbVentes || 0),
        total: Number(s.total || 0),
        moyenne: Number(s.moyenne || 0),
      };
    });

    // classement interne squad par total
    result.sort((a, b) => b.total - a.total);

    res.json({
      squadId: squad.id,
      from: from || null,
      to: to || null,
      classement: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/**
 * GET /stats/classement
 * ADMIN: classement global des commerciaux (total ventes)
 * Option: ?from&to&limit=10
 */
router.get("/classement", role("ADMIN"), async (req, res) => {
  try {
    const { from, to, limit } = req.query;
    const max = Math.min(Number(limit || 10), 50);

    const where = {
      ...buildDateWhere(from, to),
    };

    const rows = await Vente.findAll({
      where,
      attributes: [
        "idCommercial",
        [Sequelize.fn("SUM", Sequelize.col("montant")), "total"],
        [Sequelize.fn("COUNT", Sequelize.col("id")), "nbVentes"],
      ],
      group: ["idCommercial"],
      order: [[Sequelize.literal("total"), "DESC"]],
      limit: max,
      raw: true,
    });

    // récupérer info user pour ces commerciaux
    const ids = rows.map((r) => Number(r.idCommercial));
    const users = await Users.findAll({
      where: { id: { [Op.in]: ids } },
      attributes: ["id", "nom", "prenom", "email", "idSquad", "role", "actif"],
      raw: true,
    });

    const userById = Object.fromEntries(users.map((u) => [u.id, u]));

    const classement = rows.map((r, idx) => ({
      rank: idx + 1,
      commercial: userById[Number(r.idCommercial)] || { id: Number(r.idCommercial) },
      total: Number(r.total || 0),
      nbVentes: Number(r.nbVentes || 0),
    }));

    res.json({
      from: from || null,
      to: to || null,
      limit: max,
      classement,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
