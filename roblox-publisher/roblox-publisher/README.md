# 🎮 Roblox Publisher Backend

Backend Node.js qui permet à tes joueurs de publier leurs créations directement sur leur compte Roblox.

---

## 📁 Structure
```
roblox-publisher/
├── server.js              ← Serveur principal
├── routes/
│   └── publish.js         ← Routes API (publication + validation)
├── utils/
│   └── rbxlGenerator.js   ← Génère le fichier .rbxlx
├── .env.example           ← Modèle de configuration
├── railway.json           ← Config Railway
└── package.json
```

---

## 🚀 Déploiement sur Railway (gratuit, tourne 24h/24)

### Étape 1 — Crée un compte Railway
→ Va sur https://railway.app et connecte-toi avec GitHub

### Étape 2 — Mets le code sur GitHub
1. Crée un compte GitHub sur https://github.com
2. Crée un nouveau repository (bouton "New")
3. Upload tous les fichiers de ce dossier dedans

### Étape 3 — Déploie sur Railway
1. Sur Railway → "New Project" → "Deploy from GitHub repo"
2. Sélectionne ton repository
3. Railway détecte automatiquement Node.js et installe tout

### Étape 4 — Configure les variables d'environnement
Dans Railway → ton projet → "Variables" → ajoute :
```
SECRET_KEY=mets_une_longue_cle_secrete_ici
```
(invente n'importe quelle suite de caractères, genre : xK9mP2qL8nR5vT3w)

### Étape 5 — Récupère l'URL de ton serveur
Railway te donne une URL du genre :
`https://ton-projet.up.railway.app`

**C'est cette URL que tu mettras dans ton script Roblox !**

---

## 📡 Endpoints API

### GET /
Vérifie que le serveur est en ligne.

### POST /publish
Publie un jeu sur le compte Roblox d'un joueur.

**Body JSON :**
```json
{
  "secretKey": "ta_cle_secrete",
  "apiKey": "cle_api_roblox_du_joueur",
  "universeId": "universe_id_du_joueur",
  "placeId": "place_id_du_joueur",
  "gameData": {
    "name": "Mon Super Jeu",
    "includeBaseplate": true,
    "objects": [
      {
        "name": "Part",
        "x": 0, "y": 5, "z": 0,
        "sizeX": 4, "sizeY": 1, "sizeZ": 2,
        "colorR": 163, "colorG": 162, "colorB": 165,
        "material": "SmoothPlastic",
        "anchored": true,
        "shape": "Block"
      }
    ],
    "scripts": [],
    "lighting": {
      "brightness": 2,
      "timeOfDay": "14:00:00"
    }
  }
}
```

### POST /publish/validate-key
Vérifie qu'une clé API Roblox est valide.

**Body JSON :**
```json
{
  "secretKey": "ta_cle_secrete",
  "apiKey": "cle_api_roblox_du_joueur",
  "universeId": "universe_id_du_joueur"
}
```

---

## 🎮 Instructions pour tes joueurs

Pour que tes joueurs puissent publier, ils doivent :

1. Aller sur https://create.roblox.com/credentials
2. Créer une clé API avec ces permissions :
   - API System : `universe-places`
   - Operation : `Write`
   - Experience : leur jeu
3. Récupérer leur Universe ID et Place ID sur https://create.roblox.com/dashboard/creations
4. Entrer ces infos dans ton jeu

---

## 🔒 Sécurité
- La `SECRET_KEY` empêche n'importe qui d'appeler ton backend
- Rate limiting : max 10 publications/minute par IP
- Les clés API Roblox des joueurs ne sont jamais stockées
