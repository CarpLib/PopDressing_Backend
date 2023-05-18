const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

mongoose.connect(process.env.MONGODB_URI);
const app = express();
app.use(express.json());
app.use(cors());

app.all("*", (req, res) => {
  res.json({ message: "Route introuvable" });
});

app.listen(process.env.PORT, () => {
  console.log("🚀 Démarrage du Serveur 🚀");
});
