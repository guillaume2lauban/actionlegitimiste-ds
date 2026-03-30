# Cercle d'Action Légitimiste – Site web

Site complet avec frontend et backend pour l’association.

## Installation

1. Clonez le dépôt.
2. Allez dans `backend`, installez les dépendances : `npm install`.
3. Créez un fichier `.env` avec vos identifiants email.
4. Lancez le serveur : `npm start`.
5. Ouvrez `http://localhost:3000`.

## Modification des actualités

Les articles sont dans `data/news.json`. Chaque article a un `id`, un `title`, une `date`, une `image` (URL), un `summary` et un `content` (HTML).

## Structure

- **index.html** – Accueil
- **mouvement.html** – Description du mouvement
- **doctrine.html** – Doctrine légitimiste
- **soutenir.html** – Adhésion, boutique, dons
- **famille-royale.html** – Présentation de Louis XX et sa famille
- **actualites.html** – Liste des articles
- **article.html** – Page d’article détaillé
- **css/** – Styles
- **js/** – Scripts
- **backend/** – API contact

## Personnalisation

- Modifiez les couleurs dans `css/style.css` (variables `--bleu`, `--ocre`).
- Les liens vers les réseaux sociaux sont dans le footer.
- Pour la boutique Redbubble, remplacez l’URL par la vôtre.