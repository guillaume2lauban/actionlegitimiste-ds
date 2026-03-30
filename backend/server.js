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

// Servir les fichiers statiques depuis la racine (HTML, CSS, JS, data)
app.use(express.static(path.join(__dirname, '..')));

app.use('/api/contact', contactLimiter, contactRoutes);

// Route catch-all pour les pages HTML
app.get('*', (req, res) => {
  const filePath = path.join(__dirname, '..', req.path);
  // Vérifier si le fichier existe (simple check)
  if (req.path === '/' || req.path === '/index.html') {
    res.sendFile(path.join(__dirname, '../index.html'));
  } else if (req.path === '/doctrine.html') {
    res.sendFile(path.join(__dirname, '../doctrine.html'));
  } else if (req.path === '/actions.html') {
    res.sendFile(path.join(__dirname, '../actions.html'));
  } else if (req.path === '/actualites.html') {
    res.sendFile(path.join(__dirname, '../actualites.html'));
  } else if (req.path === '/famille-royale.html') {
    res.sendFile(path.join(__dirname, '../famille-royale.html'));
  } else if (req.path === '/soutenir.html') {
    res.sendFile(path.join(__dirname, '../soutenir.html'));
  } else if (req.path === '/contact.html') {
    res.sendFile(path.join(__dirname, '../contact.html'));
  } else {
    // Si le fichier demandé existe, on le sert, sinon 404
    res.status(404).sendFile(path.join(__dirname, '../404.html'));
  }
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});