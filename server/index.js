
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const db = require("./models");

// BE routes only
app.use("/auth", require("./routes/auth"));

app.use("/users", require("./routes/users"));   // Added users route
app.use("/squads", require("./routes/squads"));
app.use("/ventes", require("./routes/ventes"));
app.use("/messages", require("./routes/messages"));
app.use("/stats", require("./routes/stats"));
app.use("/auth", require("./routes/auth"));


app.get("/", (req, res) => {
  res.send("API BE Évaluation Commerciale OK");
});

db.sequelize
  .sync()
  .then(() => {
    console.log("✅ Base de données connectée");
    app.listen(3004, () => {
      console.log("🚀 Serveur BE lancé sur http://localhost:3004");
    });
  })
  .catch((err) => {
    console.error("❌ Erreur DB :", err);
  });
