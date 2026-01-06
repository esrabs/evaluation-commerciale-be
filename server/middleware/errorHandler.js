module.exports = (err, req, res, next) => {
  console.error("❌ Erreur :", err);

  const status = err.status || 500;
  const message = err.message || "Erreur interne du serveur";

  res.status(status).json({
    error: message,
  });
};
