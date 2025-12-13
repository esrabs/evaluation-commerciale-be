module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define("Users", {
    nom: { type: DataTypes.STRING(100), allowNull: false },
    prenom: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    motDePasse: { type: DataTypes.STRING(255), allowNull: false }, // hashé bcrypt
    role: {
      type: DataTypes.ENUM("ADMIN", "GESTIONNAIRE", "COMMERCIAL"),
      allowNull: false,
    },
    actif: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  });

  Users.associate = (models) => {
    // FK idSquad (nullable)
    Users.belongsTo(models.Squad, { foreignKey: "idSquad" });

    // FK: VENTE.idCommercial
    Users.hasMany(models.Vente, { foreignKey: "idCommercial", as: "ventes" });

    // FK: MESSAGE.idExpediteur / idDestinataire
    Users.hasMany(models.Message, { foreignKey: "idExpediteur", as: "messagesEnvoyes" });
    Users.hasMany(models.Message, { foreignKey: "idDestinataire", as: "messagesRecus" });
  };

  return Users;
};
