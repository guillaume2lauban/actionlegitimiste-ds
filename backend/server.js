require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const contactRoutes = require('./routes/contact');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Limiteur de taux pour l'API contact
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requêtes max par IP
  message: 'Trop de messages envoyés depuis cette adresse IP, veuillez réessayer après 15 minutes.'
});

// Servir les fichiers statiques du frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes API
app.use('/api/contact', contactLimiter, contactRoutes);

// Route catch-all pour le SPA (si besoin) - ici on gère les pages HTML
app.get('*', (req, res) => {
  const requestedPath = req.path;
  if (requestedPath === '/' || requestedPath === '/index.html') {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  } else if (requestedPath === '/doctrine.html') {
    res.sendFile(path.join(__dirname, '../frontend/doctrine.html'));
  } else if (requestedPath === '/soutenir.html') {
    res.sendFile(path.join(__dirname, '../frontend/soutenir.html'));
  } else if (requestedPath === '/actions.html') {
    res.sendFile(path.join(__dirname, '../frontend/actions.html'));
  } else if (requestedPath === '/contact.html') {
    res.sendFile(path.join(__dirname, '../frontend/contact.html'));
  } else {
    res.status(404).sendFile(path.join(__dirname, '../frontend/404.html'));
  }
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});