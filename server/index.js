require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();

// =========================
// Sécurité & middlewares
// =========================

// Headers de sécurité
app.use(helmet());

// CORS limité (front uniquement)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
  })
);

// Body parser JSON
app.use(express.json());

// =========================
// Rate limit (anti brute-force)
// =========================
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 tentatives par IP
  message: { error: "Trop de tentatives, réessayez plus tard" },
});

app.use("/auth/login", loginLimiter);

// =========================
// Routes
// =========================
app.use("/auth", require("./routes/auth"));
app.use("/users", require("./routes/users"));
app.use("/squads", require("./routes/squads"));
app.use("/ventes", require("./routes/ventes"));
app.use("/messages", require("./routes/messages"));
app.use("/stats", require("./routes/stats"));

// Route test
app.get("/", (req, res) => {
  res.send("API BE Évaluation Commerciale OK");
});

// =========================
// Base de données & serveur
// =========================
const db = require("./models");

db.sequelize
  .authenticate()
  .then(() => {
    console.log(" Base de données connectée");
    const PORT = process.env.PORT || 3004;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(` Serveur BE lancé sur http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error(" Erreur DB :", err);
  });
