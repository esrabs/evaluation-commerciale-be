const { Op } = require("sequelize");
const { Vente, Users, Squad } = require("../models");

exports.createVente = async (req, res) => {
  const { dateVente, montant } = req.body;

  const vente = await Vente.create({
    dateVente,
    montant,
    idCommercial: req.user.id,
  });

  return res.status(201).json(vente);
};

exports.getMyVentes = async (req, res) => {
  const { from, to } = req.query;

  const where = { idCommercial: req.user.id };

  if (from && to) where.dateVente = { [Op.between]: [from, to] };
  else if (from) where.dateVente = { [Op.gte]: from };
  else if (to) where.dateVente = { [Op.lte]: to };

  const ventes = await Vente.findAll({
    where,
    order: [["dateVente", "DESC"]],
  });

  return res.json(ventes);
};

exports.getSquadVentes = async (req, res) => {
  const { from, to } = req.query;

  const squad = await Squad.findOne({ where: { idGestionnaire: req.user.id } });
  if (!squad) {
    return res.status(404).json({ error: "Aucune squad assignée à ce gestionnaire" });
  }

  const commerciaux = await Users.findAll({
    where: { idSquad: squad.id, role: "COMMERCIAL", actif: true },
    attributes: ["id"],
  });

  const ids = commerciaux.map((c) => c.id);
  if (ids.length === 0) return res.json([]);

  const whereVentes = { idCommercial: { [Op.in]: ids } };

  if (from && to) whereVentes.dateVente = { [Op.between]: [from, to] };
  else if (from) whereVentes.dateVente = { [Op.gte]: from };
  else if (to) whereVentes.dateVente = { [Op.lte]: to };

  const ventes = await Vente.findAll({
    where: whereVentes,
    include: [
      { model: Users, as: "commercial", attributes: ["id", "nom", "prenom", "email"] },
    ],
    order: [["dateVente", "DESC"]],
  });

  return res.json(ventes);
};

exports.getAllVentes = async (req, res) => {
  const ventes = await Vente.findAll({
    include: [
      { model: Users, as: "commercial", attributes: ["id", "nom", "prenom", "email", "idSquad"] },
    ],
    order: [["dateVente", "DESC"]],
  });

  return res.json(ventes);
};
