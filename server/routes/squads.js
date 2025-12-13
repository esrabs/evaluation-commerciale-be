const router = require("express").Router();
const { Squad, Users } = require("../models");

const auth = require("../middleware/auth");
const role = require("../middleware/role");

// ✅ Tout ici réservé à ADMIN
router.use(auth, role("ADMIN"));

/**
 * POST /squads
 * Créer une squad
 * Body: { nomSquad, idGestionnaire? }
 */
router.post("/", async (req, res) => {
  try {
    const { nomSquad, idGestionnaire } = req.body;
    if (!nomSquad) return res.status(400).json({ error: "nomSquad requis" });

    // (optionnel) vérifier que le gestionnaire existe et a le bon rôle
    if (idGestionnaire) {
      const gest = await Users.findByPk(idGestionnaire);
      if (!gest) return res.status(404).json({ error: "Gestionnaire introuvable" });
      if (gest.role !== "GESTIONNAIRE") {
        return res.status(400).json({ error: "L'utilisateur n'est pas GESTIONNAIRE" });
      }
    }

    const squad = await Squad.create({
      nomSquad,
      idGestionnaire: idGestionnaire ?? null,
    });

    res.status(201).json(squad);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/**
 * GET /squads
 * Lister toutes les squads + gestionnaire + membres (optionnel)
 */
router.get("/", async (req, res) => {
  try {
    const squads = await Squad.findAll({
      order: [["id", "ASC"]],
      include: [
        { model: Users, as: "gestionnaire", attributes: ["id", "nom", "prenom", "email", "role", "actif"] },
        { model: Users, as: "membres", attributes: ["id", "nom", "prenom", "email", "role", "actif"] },
      ],
    });

    res.json(squads);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/**
 * GET /squads/:id
 * Détails d'une squad
 */
router.get("/:id", async (req, res) => {
  try {
    const squad = await Squad.findByPk(req.params.id, {
      include: [
        { model: Users, as: "gestionnaire", attributes: ["id", "nom", "prenom", "email", "role", "actif"] },
        { model: Users, as: "membres", attributes: ["id", "nom", "prenom", "email", "role", "actif"] },
      ],
    });

    if (!squad) return res.status(404).json({ error: "Squad introuvable" });
    res.json(squad);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/**
 * PUT /squads/:id
 * Modifier une squad (nomSquad / idGestionnaire)
 * Body: { nomSquad?, idGestionnaire? }
 */
router.put("/:id", async (req, res) => {
  try {
    const squad = await Squad.findByPk(req.params.id);
    if (!squad) return res.status(404).json({ error: "Squad introuvable" });

    const { nomSquad, idGestionnaire } = req.body;

    if (nomSquad) squad.nomSquad = nomSquad;

    if (idGestionnaire === null) {
      squad.idGestionnaire = null;
    } else if (typeof idGestionnaire === "number") {
      const gest = await Users.findByPk(idGestionnaire);
      if (!gest) return res.status(404).json({ error: "Gestionnaire introuvable" });
      if (gest.role !== "GESTIONNAIRE") {
        return res.status(400).json({ error: "L'utilisateur n'est pas GESTIONNAIRE" });
      }
      squad.idGestionnaire = idGestionnaire;
    }

    await squad.save();
    res.json(squad);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/**
 * PUT /squads/:id/members
 * Affecter des membres à une squad (met à jour Users.idSquad)
 * Body: { userIds: [1,2,3] }
 *
 * Règle : on affecte uniquement des COMMERCIAL (recommandé)
 */
router.put("/:id/members", async (req, res) => {
  try {
    const squadId = Number(req.params.id);
    const { userIds } = req.body;

    if (!Array.isArray(userIds)) {
      return res.status(400).json({ error: "userIds doit être un tableau" });
    }

    const squad = await Squad.findByPk(squadId);
    if (!squad) return res.status(404).json({ error: "Squad introuvable" });

    // vérifier tous les users + rôle
    const users = await Users.findAll({ where: { id: userIds } });
    if (users.length !== userIds.length) {
      return res.status(400).json({ error: "Un ou plusieurs users introuvables" });
    }

    const nonCommercial = users.filter((u) => u.role !== "COMMERCIAL");
    if (nonCommercial.length > 0) {
      return res.status(400).json({
        error: "Seuls les COMMERCIAL peuvent être membres",
        ids: nonCommercial.map((u) => u.id),
      });
    }

    // affecter la squad à ces commerciaux
    await Users.update(
      { idSquad: squadId },
      { where: { id: userIds } }
    );

    res.json({ ok: true, message: "Membres affectés", squadId, userIds });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/**
 * DELETE /squads/:id
 * (optionnel) supprimer une squad (hard delete)
 * Attention: si des users y sont liés, ils garderont idSquad => il faut décider une règle.
 */
router.delete("/:id", async (req, res) => {
  try {
    const squad = await Squad.findByPk(req.params.id);
    if (!squad) return res.status(404).json({ error: "Squad introuvable" });

    // règle simple: retirer tous les membres (idSquad=null) avant de supprimer
    await Users.update({ idSquad: null }, { where: { idSquad: squad.id } });

    await squad.destroy();
    res.json({ ok: true, message: "Squad supprimée" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
