const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const { createAgent } = require("@forestadmin/agent");
const {
  createMongooseDataSource,
} = require("@forestadmin/datasource-mongoose");
const mongoDb = mongoose.createConnection(process.env.MONGODB_URI);
const app = express();
app.use(express.json());
app.use(cors());

const userRoutes = require("./routes/user");
app.use(userRoutes);

createAgent({
  authSecret: process.env.FOREST_AUTH_SECRET,
  envSecret: process.env.FOREST_ENV_SECRET,
  isProduction: process.env.NODE_ENV === "production",
})
  .addDataSource(createMongooseDataSource(mongoDb, { flattenMode: "none" }))
  .mountOnExpress(app)
  .start();

app.all("*", (req, res) => {
  res.json({ message: "Route introuvable" });
});

app.listen(process.env.PORT, () => {
  console.log("🚀 Démarrage du Serveur 🚀");
});
