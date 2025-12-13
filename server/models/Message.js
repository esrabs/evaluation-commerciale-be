module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define("Message", {
    titre: { type: DataTypes.STRING(150), allowNull: false },
    contenu: { type: DataTypes.TEXT, allowNull: false },
    dateEnvoi: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    lu: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  });

  Message.associate = (models) => {
    Message.belongsTo(models.Users, { foreignKey: "idExpediteur", as: "expediteur" });
    Message.belongsTo(models.Users, { foreignKey: "idDestinataire", as: "destinataire" });
  };

  return Message;
};
