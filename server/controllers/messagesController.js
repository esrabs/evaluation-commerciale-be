const { Message, Users } = require("../models");

/**
 * Envoyer un message
 */
exports.sendMessage = async (req, res) => {
  const { idDestinataire, titre, contenu } = req.body;

  // vérifier destinataire
  const dest = await Users.findByPk(idDestinataire);
  if (!dest || !dest.actif) {
    return res.status(404).json({ error: "Destinataire introuvable" });
  }

  const msg = await Message.create({
    idExpediteur: req.user.id,
    idDestinataire,
    titre,
    contenu,
    lu: false,
  });

  return res.status(201).json(msg);
};

/**
 * Voir mes messages reçus
 */
exports.getRecus = async (req, res) => {
  const msgs = await Message.findAll({
    where: { idDestinataire: req.user.id },
    include: [
      {
        model: Users,
        as: "expediteur",
        attributes: ["id", "nom", "prenom", "email", "role"],
      },
    ],
    order: [["dateEnvoi", "DESC"]],
  });

  return res.json(msgs);
};

/**
 * Voir mes messages envoyés
 */
exports.getEnvoyes = async (req, res) => {
  const msgs = await Message.findAll({
    where: { idExpediteur: req.user.id },
    include: [
      {
        model: Users,
        as: "destinataire",
        attributes: ["id", "nom", "prenom", "email", "role"],
      },
    ],
    order: [["dateEnvoi", "DESC"]],
  });

  return res.json(msgs);
};

/**
 * Marquer un message comme lu
 */
exports.markAsRead = async (req, res) => {
  const msg = await Message.findByPk(req.params.id);
  if (!msg) {
    return res.status(404).json({ error: "Message introuvable" });
  }

  // sécurité : seul le destinataire
  if (msg.idDestinataire !== req.user.id) {
    return res.status(403).json({ error: "Accès interdit" });
  }

  msg.lu = true;
  await msg.save();

  return res.json({ ok: true, message: "Message marqué comme lu", id: msg.id });
};

/**
 * Lire un message (expéditeur ou destinataire)
 */
exports.getById = async (req, res) => {
  const msg = await Message.findByPk(req.params.id, {
    include: [
      { model: Users, as: "expediteur", attributes: ["id", "nom", "prenom", "email", "role"] },
      { model: Users, as: "destinataire", attributes: ["id", "nom", "prenom", "email", "role"] },
    ],
  });

  if (!msg) {
    return res.status(404).json({ error: "Message introuvable" });
  }

  const isOwner =
    msg.idExpediteur === req.user.id || msg.idDestinataire === req.user.id;

  if (!isOwner) {
    return res.status(403).json({ error: "Accès interdit" });
  }

  return res.json(msg);
};
