const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Users } = require("../models");

exports.login = async (req, res) => {
  const { email, motDePasse } = req.body;

  const user = await Users.findOne({ where: { email } });
  if (!user || !user.actif) {
    return res.status(401).json({ error: "Identifiants invalides" });
  }

  const ok = await bcrypt.compare(motDePasse, user.motDePasse);
  if (!ok) {
    return res.status(401).json({ error: "Identifiants invalides" });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: "JWT_SECRET manquant côté serveur" });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "8h",
  });

  return res.json({
    token,
    user: {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
    },
  });
};
