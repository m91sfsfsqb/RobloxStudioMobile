// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const publishRouter = require("./routes/publish");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Rate limiting : max 10 publications par minute par IP
const publishLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, error: "Trop de requêtes, attends 1 minute" },
});

// Routes
app.use("/publish", publishLimiter, publishRouter);

// Route de santé (pour Railway / vérifier que le serveur tourne)
app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "Roblox Publisher Backend opérationnel 🟢",
    version: "1.0.0",
  });
});

// Démarrage
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}`);
});
