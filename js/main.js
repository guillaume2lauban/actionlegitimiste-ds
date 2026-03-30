// Initialisation AOS avec durée et offset réduits
AOS.init({
    duration: 600,
    once: true,
    offset: 50,
    easing: 'ease-out'
});

// Menu burger
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
const menuOverlay = document.getElementById('menuOverlay');

function toggleMenu() {
    navLinks.classList.toggle('nav-active');
    burger.classList.toggle('toggle');
    menuOverlay.classList.toggle('active');
    document.body.classList.toggle('no-scroll');
}
if (burger) burger.addEventListener('click', toggleMenu);
if (menuOverlay) menuOverlay.addEventListener('click', toggleMenu);

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        if (navLinks.classList.contains('nav-active')) toggleMenu();
    });
});

// Gestion de l'affichage du menu uniquement en haut de page
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Masquer le menu dès qu'on scroll vers le bas (même légèrement)
    if (currentScroll > 10) {
        navbar.classList.add('navbar-hidden');
    } else {
        navbar.classList.remove('navbar-hidden');
    }
    
    // Ajouter un fond semi-transparent quand on a scrollé un peu
    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Charger actualités
async function loadNews(containerId, limit = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        const response = await fetch('/data/news.json');
        const data = await response.json();
        let articles = data.articles;
        if (limit) articles = articles.slice(0, limit);

        container.innerHTML = articles.map(article => `
            <div class="news-card" data-aos="fade-up">
                <img src="${article.image}" alt="${article.title}" class="news-image">
                <div class="news-date">${article.date}</div>
                <h3>${article.title}</h3>
                <p>${article.summary.substring(0, 150)}${article.summary.length > 150 ? '...' : ''}</p>
                <a href="article.html?id=${article.id}" class="read-more">Lire la suite <i class="fas fa-arrow-right"></i></a>
            </div>
        `).join('');
    } catch (error) {
        console.error('Erreur chargement actualités:', error);
        container.innerHTML = '<p>Impossible de charger les actualités.</p>';
    }
}

if (document.getElementById('news-list')) loadNews('news-list', 3);
if (document.getElementById('news-list-full')) loadNews('news-list-full');

// Charger un article
async function loadArticle() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;

    const container = document.getElementById('article-content');
    if (!container) return;

    try {
        const response = await fetch('/data/news.json');
        const data = await response.json();
        const article = data.articles.find(a => a.id == id);
        if (!article) {
            container.innerHTML = '<p>Article non trouvé.</p>';
            return;
        }
        container.innerHTML = `
            <h1>${article.title}</h1>
            <div class="article-meta">${article.date}</div>
            <img src="${article.image}" alt="${article.title}" class="article-image">
            <div class="article-body">${article.content}</div>
        `;
    } catch (error) {
        console.error('Erreur chargement article:', error);
        container.innerHTML = '<p>Impossible de charger l\'article.</p>';
    }
}
if (window.location.pathname.includes('article.html')) loadArticle();

// Formulaire de contact footer
const contactForm = document.getElementById('footer-contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(contactForm);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message')
        };

        const statusDiv = contactForm.querySelector('.form-status');
        statusDiv.style.display = 'block';
        statusDiv.textContent = 'Envoi en cours...';

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (response.ok) {
                statusDiv.className = 'form-status success';
                statusDiv.textContent = 'Message envoyé avec succès !';
                contactForm.reset();
            } else {
                statusDiv.className = 'form-status error';
                statusDiv.textContent = result.error || 'Erreur lors de l\'envoi.';
            }
        } catch (error) {
            statusDiv.className = 'form-status error';
            statusDiv.textContent = 'Erreur réseau. Veuillez réessayer.';
        }
        setTimeout(() => { statusDiv.style.display = 'none'; }, 5000);
    });
}