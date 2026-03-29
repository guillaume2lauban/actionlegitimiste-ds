require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const contactRoutes = require('./routes/contact');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Trop de messages envoyés depuis cette adresse IP, veuillez réessayer après 15 minutes.'
});

// Servir les fichiers statiques depuis la racine (là où se trouvent les HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '..'))); // ← on monte d'un niveau pour atteindre la racine

app.use('/api/contact', contactLimiter, contactRoutes);

// Route catch-all pour gérer le SPA (ou renvoyer 404)
app.get('*', (req, res) => {
  // Si l'URL correspond à une page HTML existante, on la sert, sinon 404
  const requestedPath = req.path;
  if (requestedPath === '/' || requestedPath === '/index.html') {
    res.sendFile(path.join(__dirname, '../index.html'));
  } else if (requestedPath === '/doctrine.html') {
    res.sendFile(path.join(__dirname, '../doctrine.html'));
  } else if (requestedPath === '/soutenir.html') {
    res.sendFile(path.join(__dirname, '../soutenir.html'));
  } else if (requestedPath === '/actions.html') {
    res.sendFile(path.join(__dirname, '../actions.html'));
  } else if (requestedPath === '/contact.html') {
    res.sendFile(path.join(__dirname, '../contact.html'));
  } else {
    res.status(404).sendFile(path.join(__dirname, '../404.html'));
  }
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});