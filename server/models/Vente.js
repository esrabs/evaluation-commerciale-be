module.exports = (sequelize, DataTypes) => {
  const Vente = sequelize.define("Vente", {
    dateVente: { type: DataTypes.DATEONLY, allowNull: false },
    montant: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  });

  Vente.associate = (models) => {
  Vente.belongsTo(models.Users, { foreignKey: "idCommercial", as: "commercial" });
};


  return Vente;
};
