const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Users } = require("../models"); // important : nom exact de ton modèle

// POST /auth/register
router.post("/register", async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse, role } = req.body;

    if (!nom || !prenom || !email || !motDePasse || !role) {
      return res.status(400).json({ error: "Champs manquants" });
    }

    const existing = await Users.findOne({ where: { email } });
    if (existing) return res.status(409).json({ error: "Email déjà utilisé" });

    const hash = await bcrypt.hash(motDePasse, 10);

    const user = await Users.create({
      nom,
      prenom,
      email,
      motDePasse: hash,
      role,
      actif: true,
    });

    res.status(201).json({ id: user.id, email: user.email, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, motDePasse } = req.body;
    if (!email || !motDePasse) {
      return res.status(400).json({ error: "Champs manquants" });
    }

    const user = await Users.findOne({ where: { email } });
    if (!user || !user.actif) return res.status(401).json({ error: "Identifiants invalides" });

    const ok = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!ok) return res.status(401).json({ error: "Identifiants invalides" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      token,
      user: { id: user.id, nom: user.nom, prenom: user.prenom, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
