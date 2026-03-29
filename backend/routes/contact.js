const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Configuration du transporteur email (à remplacer par vos identifiants)
// Pour utiliser ProtonMail, vous pouvez utiliser un service SMTP relais ou un compte Gmail/Outlook.
// Ici, exemple avec Gmail (vous devez configurer un mot de passe d'application)
const transporter = nodemailer.createTransport({
  service: 'gmail', // ou 'protonmail' nécessite une configuration SMTP spécifique
  auth: {
    user: process.env.EMAIL_USER, // votre email
    pass: process.env.EMAIL_PASS  // mot de passe d'application
  }
});

// Vérifier la connexion au démarrage
transporter.verify((error, success) => {
  if (error) {
    console.error('Erreur de connexion SMTP:', error);
  } else {
    console.log('Serveur email prêt à envoyer des messages');
  }
});

router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'Tous les champs sont requis.' });
  }

  // Validation simple de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Adresse email invalide.' });
  }

  const mailOptions = {
    from: `"Formulaire de contact" <${process.env.EMAIL_USER}>`,
    to: 'legitimiste@protonmail.com',
    replyTo: email,
    subject: `[Site CAL] ${subject}`,
    text: `Nom: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    html: `
      <h3>Nouveau message du formulaire de contact</h3>
      <p><strong>Nom:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Sujet:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Votre message a été envoyé avec succès.' });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du mail:', error);
    res.status(500).json({ error: 'Une erreur est survenue lors de l\'envoi du message.' });
  }
});

module.exports = router;