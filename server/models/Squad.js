module.exports = (sequelize, DataTypes) => {
  const Squad = sequelize.define("Squad", {
    nomSquad: { type: DataTypes.STRING(100), allowNull: false },

    // ✅ AJOUT IMPORTANT
    idGestionnaire: { type: DataTypes.INTEGER, allowNull: true },
  });

  Squad.associate = (models) => {
    // un gestionnaire responsable (FK vers Users)
    Squad.belongsTo(models.Users, {
      foreignKey: "idGestionnaire",
      as: "gestionnaire",
    });

    // une squad a plusieurs utilisateurs (commerciaux)
    Squad.hasMany(models.Users, {
      foreignKey: "idSquad",
      as: "membres",
    });
  };

  return Squad;
};
