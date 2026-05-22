// routes/publish.js
const express = require("express");
const axios = require("axios");
const { generateRbxlx } = require("../utils/rbxlGenerator");

const router = express.Router();

// POST /publish
// Reçoit les données du jeu + la clé API du joueur, génère le .rbxlx et publie sur Roblox
router.post("/", async (req, res) => {
  try {
    const { apiKey, universeId, placeId, gameData, secretKey } = req.body;

    // Vérification de la clé secrète (empêche les appels non autorisés)
    if (secretKey !== process.env.SECRET_KEY) {
      return res.status(403).json({
        success: false,
        error: "Clé secrète invalide"
      });
    }

    // Vérification des champs obligatoires
    if (!apiKey || !universeId || !placeId || !gameData) {
      return res.status(400).json({
        success: false,
        error: "Champs manquants : apiKey, universeId, placeId, gameData sont requis"
      });
    }

    // Génération du fichier .rbxlx
    const rbxlxContent = generateRbxlx(gameData);
    const fileBuffer = Buffer.from(rbxlxContent, "utf-8");

    // Appel à l'API Open Cloud de Roblox
    const url = `https://apis.roblox.com/universes/v1/${universeId}/places/${placeId}/versions?versionType=Published`;

    const response = await axios.post(url, fileBuffer, {
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/octet-stream",
      },
      maxBodyLength: Infinity,
    });

    return res.json({
      success: true,
      message: "Jeu publié avec succès !",
      versionNumber: response.data?.versionNumber || null,
    });

  } catch (error) {
    console.error("Erreur publication:", error?.response?.data || error.message);

    // Messages d'erreur compréhensibles
    let errorMessage = "Erreur inconnue";
    const status = error?.response?.status;

    if (status === 401) errorMessage = "Clé API invalide ou expirée";
    else if (status === 403) errorMessage = "La clé API n'a pas les permissions nécessaires sur ce jeu";
    else if (status === 404) errorMessage = "Universe ID ou Place ID introuvable";
    else if (status === 429) errorMessage = "Trop de requêtes, réessaie dans quelques secondes";
    else if (error.message) errorMessage = error.message;

    return res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

// POST /validate-key
// Vérifie qu'une clé API est valide sans publier
router.post("/validate-key", async (req, res) => {
  try {
    const { apiKey, universeId, secretKey } = req.body;

    if (secretKey !== process.env.SECRET_KEY) {
      return res.status(403).json({ success: false, error: "Clé secrète invalide" });
    }

    if (!apiKey || !universeId) {
      return res.status(400).json({ success: false, error: "apiKey et universeId requis" });
    }

    // On essaie de récupérer les infos du jeu pour valider la clé
    const response = await axios.get(
      `https://apis.roblox.com/cloud/v2/universes/${universeId}`,
      { headers: { "x-api-key": apiKey } }
    );

    return res.json({
      success: true,
      message: "Clé API valide !",
      experienceName: response.data?.displayName || "Jeu trouvé",
    });

  } catch (error) {
    const status = error?.response?.status;
    let errorMessage = "Clé invalide";
    if (status === 401) errorMessage = "Clé API incorrecte";
    else if (status === 403) errorMessage = "Permissions insuffisantes";
    else if (status === 404) errorMessage = "Universe ID introuvable";

    return res.status(400).json({ success: false, error: errorMessage });
  }
});

module.exports = router;
