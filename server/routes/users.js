const router = require("express").Router();
const bcrypt = require("bcrypt");
const db = require("../models");
const { Users, sequelize } = db;

const auth = require("../middleware/auth");
const role = require("../middleware/role");

/**
 * =========================================================
 * GET /users/contacts
 * Accessible à TOUS les rôles authentifiés
 *
 * ADMIN        -> tous les utilisateurs actifs
 * GESTIONNAIRE -> admin + commerciaux de sa squad
 * COMMERCIAL   -> admin + gestionnaire de sa squad + commerciaux de sa squad
 * =========================================================
 */
router.get("/contacts", auth, async (req, res) => {
  try {
    const me = await Users.findByPk(req.user.id);
    if (!me) return res.status(404).json({ error: "Utilisateur introuvable" });

    // ================= ADMIN =================
    if (me.role === "ADMIN") {
      const users = await Users.findAll({
        where: { actif: true },
        attributes: ["id", "nom", "prenom", "email", "role", "idSquad"],
        order: [["prenom", "ASC"], ["nom", "ASC"]],
      });
      return res.json(users.filter((u) => u.id !== me.id));
    }

    // ================= GESTIONNAIRE =================
    if (me.role === "GESTIONNAIRE") {
      const contacts = await sequelize.query(
        `
        SELECT u.id, u.nom, u.prenom, u.email, u.role, u.idSquad
        FROM Users u
        WHERE u.actif = 1
          AND u.id <> :meId
          AND (
            u.role = 'ADMIN'
            OR (u.role = 'COMMERCIAL' AND u.idSquad = (
              SELECT s.id FROM Squads s WHERE s.idGestionnaire = :meId LIMIT 1
            ))
          )
        ORDER BY u.prenom ASC, u.nom ASC
        `,
        {
          replacements: { meId: me.id },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      return res.json(contacts);
    }

    // ================= COMMERCIAL =================
    if (me.role === "COMMERCIAL") {
      if (!me.idSquad) {
        // pas de squad => seulement admin
        const admins = await Users.findAll({
          where: { actif: true, role: "ADMIN" },
          attributes: ["id", "nom", "prenom", "email", "role", "idSquad"],
        });
        return res.json(admins.filter((u) => u.id !== me.id));
      }

      const contacts = await sequelize.query(
        `
        SELECT u.id, u.nom, u.prenom, u.email, u.role, u.idSquad
        FROM Users u
        WHERE u.actif = 1
          AND u.id <> :meId
          AND (
            u.role = 'ADMIN'
            OR (u.role = 'GESTIONNAIRE' AND u.id = (
              SELECT s.idGestionnaire FROM Squads s WHERE s.id = :idSquad LIMIT 1
            ))
            OR (u.role = 'COMMERCIAL' AND u.idSquad = :idSquad)
          )
        ORDER BY u.prenom ASC, u.nom ASC
        `,
        {
          replacements: { meId: me.id, idSquad: me.idSquad },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      return res.json(contacts);
    }

    return res.json([]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* =========================================================
   A PARTIR D'ICI : ROUTES ADMIN UNIQUEMENT
========================================================= */

router.use(auth, role("ADMIN"));

/**
 * GET /users
 */
router.get("/", async (req, res) => {
  try {
    const users = await Users.findAll({
      attributes: { exclude: ["motDePasse"] },
      order: [["id", "ASC"]],
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/**
 * GET /users/:id
 */
router.get("/:id", async (req, res) => {
  try {
    const user = await Users.findByPk(req.params.id, {
      attributes: { exclude: ["motDePasse"] },
    });
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/**
 * POST /users
 */
router.post("/", async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse, role: userRole, idSquad, actif } = req.body;

    if (!nom || !prenom || !email || !motDePasse || !userRole) {
      return res.status(400).json({ error: "Champs manquants" });
    }

    const exists = await Users.findOne({ where: { email } });
    if (exists) return res.status(409).json({ error: "Email déjà utilisé" });

    const hash = await bcrypt.hash(motDePasse, 10);

    const user = await Users.create({
      nom,
      prenom,
      email,
      motDePasse: hash,
      role: userRole,
      idSquad: idSquad ?? null,
      actif: typeof actif === "boolean" ? actif : true,
    });

    res.status(201).json({
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
      idSquad: user.idSquad,
      actif: user.actif,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/**
 * PUT /users/:id
 */
router.put("/:id", async (req, res) => {
  try {
    const user = await Users.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });

    const { nom, prenom, email, role: userRole, idSquad, actif, motDePasse } = req.body;

    if (email && email !== user.email) {
      const exists = await Users.findOne({ where: { email } });
      if (exists) return res.status(409).json({ error: "Email déjà utilisé" });
      user.email = email;
    }

    if (nom) user.nom = nom;
    if (prenom) user.prenom = prenom;
    if (userRole) user.role = userRole;
    if (idSquad === null || typeof idSquad === "number") user.idSquad = idSquad;
    if (typeof actif === "boolean") user.actif = actif;

    if (motDePasse) {
      user.motDePasse = await bcrypt.hash(motDePasse, 10);
    }

    await user.save();

    res.json({
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
      idSquad: user.idSquad,
      actif: user.actif,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


/**
 * DELETE /users/:id
 */
router.delete("/:id", async (req, res) => {
  try {
    const user = await Users.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });

    user.actif = false;
    await user.save();

    res.json({ ok: true, message: "Utilisateur désactivé", id: user.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
