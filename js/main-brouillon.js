function parseFrenchDate(dateStr) {
    const months = {
        'Janvier': 0, 'Février': 1, 'Mars': 2, 'Avril': 3, 'Mai': 4, 'Juin': 5,
        'Juillet': 6, 'Août': 7, 'Septembre': 8, 'Octobre': 9, 'Novembre': 10, 'Décembre': 11
    };
    const parts = dateStr.split(' ');
    if (parts.length !== 3) return new Date(0); // fallback si le format est inattendu
    const day = parseInt(parts[0], 10);
    const month = months[parts[1].toLowerCase()];
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
}

// Initialisation AOS avec durée et offset réduits
AOS.init({
    duration: 600,
    once: true,
    offset: 50,
    easing: 'ease-out'
});

setTimeout(() => {
    const block = document.querySelector('.adhesion-block');
    if (block) {
        block.style.display = 'block';
        block.style.opacity = '1';
        block.style.transform = 'none';
    }
}, 100);

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
/*
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
if (document.getElementById('news-list-full')) loadNews('news-list-full'); */

async function loadHomeNews() {
    const container = document.getElementById('news-list');
    if (!container) return;
    try {
        const response = await fetch('/data/news.json');
        const data = await response.json();
        const articles = data.articles.slice(0, 3);
        container.innerHTML = articles.map(article => `
            <div class="news-card" data-id="${article.id}">
                <img src="${article.image}" alt="${article.title}" class="news-image">
                <div class="news-date">${article.date}</div>
                <h3>${article.title}</h3>
                <p>${article.summary.substring(0, 150)}${article.summary.length > 150 ? '...' : ''}</p>
            </div>
        `).join('');
        // Ajouter le clic sur la carte pour l'accueil aussi
        document.querySelectorAll('#news-list .news-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const id = card.getAttribute('data-id');
                sessionStorage.setItem('newsPage', 1); // on suppose page 1 pour l'accueil
                sessionStorage.setItem('newsScrollY', window.scrollY);
                window.location.href = `article.html?id=${id}`;
            });
        });
    } catch (error) {
        console.error('Erreur chargement actualités accueil:', error);
        container.innerHTML = '<p>Impossible de charger les actualités.</p>';
    }
}

if (document.getElementById('news-list')) loadHomeNews();

// Charger un article
async function loadArticle() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;

    const container = document.getElementById('article-content');
    const relatedContainer = document.getElementById('related-articles');
    if (!container) return;

    try {
        const response = await fetch('/data/news.json');
        const data = await response.json();
        const article = data.articles.find(a => a.id == id);
        if (!article) {
            container.innerHTML = '<p>Article non trouvé.</p>';
            return;
        }

        // Mise à jour du hero
        const hero = document.getElementById('article-hero');
        if (hero) {
            hero.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8)), url('${article.image}')`;
            const heroTitle = hero.querySelector('.page-hero-content h1');
            if (heroTitle) heroTitle.textContent = article.title;
        }

        // Contenu de l’article (sans titre ni image)
        container.innerHTML = `
            <div class="article-meta">${article.date}</div>
            <div class="article-body">${article.content}</div>
        `;

        // Articles similaires (même catégorie, sauf l’actuel, max 3)
        // Articles similaires (même catégorie, sauf l’actuel)
        const sameCategory = data.articles.filter(a => a.category === article.category && a.id != id);
        // Tri par date décroissante (du plus récent au plus ancien)
        sameCategory.sort((a, b) => parseFrenchDate(b.date) - parseFrenchDate(a.date));
        const related = sameCategory.slice(0, 3);
        if (related.length > 0 && relatedContainer) {
            relatedContainer.innerHTML = `
                <div class="section-header" data-aos="fade-up">
                    <h2 class="section-title">ARTICLES SIMILAIRES</h2>
                    <div class="title-decor"></div>
                </div>
                <div class="related-grid">
                    ${related.map(art => `
                        <div class="related-card" data-id="${art.id}">
                            <img src="${art.image}" alt="${art.title}" class="related-image">
                            <div class="related-date">${art.date}</div>
                            <h3>${art.title}</h3>
                            <p>${art.summary.substring(0, 100)}${art.summary.length > 100 ? '...' : ''}</p>
                        </div>
                    `).join('')}
                </div>
            `;
            document.querySelectorAll('.related-card').forEach(card => {
                card.addEventListener('click', () => {
                    const id = card.getAttribute('data-id');
                    // Sauvegarde la page actuelle et la position de scroll (pour le retour)
                    sessionStorage.setItem('newsPage', currentPage);
                    sessionStorage.setItem('newsScrollY', window.scrollY);
                    window.location.href = `article.html?id=${id}`;
                });
            });
        } else if (relatedContainer) {
            relatedContainer.innerHTML = '';
        }

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

    // Animation des compteurs
function animateCounters() {
    const counters = document.querySelectorAll('.counter-number');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-target'));
                const duration = 2000; // ms
                const step = Math.ceil(target / (duration / 30)); // 30 fps
                let current = 0;
                const updateCounter = () => {
                    current += step;
                    if (current >= target) {
                        counter.textContent = target;
                        clearInterval(interval);
                    } else {
                        counter.textContent = current;
                    }
                };
                const interval = setInterval(updateCounter, 30);
                observer.unobserve(counter); // une seule fois
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

// Exécuter après le chargement de la page
document.addEventListener('DOMContentLoaded', animateCounters);
}

let allArticles = [];               // stocke tous les articles après fetch
let currentPage = 1;
let totalPages = 1;

function getItemsPerPage() {
    const width = window.innerWidth;
    if (width >= 992) return 24;        // 3x8
    if (width >= 768) return 16;        // 2x8
    return 8;                           // 1x8
}

async function loadAllArticles() {
    try {
        const response = await fetch('/data/news.json');
        const data = await response.json();
        allArticles = data.articles;
    } catch (error) {
        console.error('Erreur chargement articles:', error);
        allArticles = [];
    }
}

function renderNewsPage(page) {
    const container = document.getElementById('news-list-full');
    if (!container) return;

    const itemsPerPage = getItemsPerPage();
    totalPages = Math.ceil(allArticles.length / itemsPerPage);
    page = Math.min(Math.max(1, page), totalPages);
    currentPage = page;

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const articlesToShow = allArticles.slice(start, end);

    container.innerHTML = articlesToShow.map(article => `
        <div class="news-card" data-id="${article.id}" data-aos="fade-up">
            <img src="${article.image}" alt="${article.title}" class="news-image">
            <div class="news-date">${article.date}</div>
            <h3>${article.title}</h3>
            <p>${article.summary.substring(0, 150)}${article.summary.length > 150 ? '...' : ''}</p>
        </div>
    `).join('');

    // Rendre la pagination
    renderPagination();

    // Ajouter les écouteurs de clic sur chaque carte
    document.querySelectorAll('.news-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const id = card.getAttribute('data-id');
            // Sauvegarder la page et la position de scroll
            sessionStorage.setItem('newsPage', currentPage);
            sessionStorage.setItem('newsScrollY', window.scrollY);
            window.location.href = `article.html?id=${id}`;
        });
    });
}

function renderPagination() {
    const paginationDiv = document.getElementById('pagination');
    if (!paginationDiv) return;

    if (totalPages <= 1) {
        paginationDiv.innerHTML = '';
        return;
    }

    let html = '<div class="pagination-controls">';
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    html += '</div>';
    paginationDiv.innerHTML = html;

    // Écouteurs pour les boutons de page
    document.querySelectorAll('.page-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const page = parseInt(btn.getAttribute('data-page'), 10);
            currentPage = page;
            renderNewsPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

async function initNewsPage() {
    await loadAllArticles();
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('page');
    const savedPage = sessionStorage.getItem('newsPage');
    if (pageParam) {
        currentPage = parseInt(pageParam, 10);
        sessionStorage.removeItem('newsPage'); // nettoie après usage
    } else if (savedPage) {
        currentPage = parseInt(savedPage, 10);
        sessionStorage.removeItem('newsPage');
    } else {
        currentPage = 1;
    }
    // Récupérer la position sauvegardée (optionnel)
    const savedScroll = sessionStorage.getItem('newsScrollY');
    renderNewsPage(currentPage);
    if (savedScroll) {
        setTimeout(() => window.scrollTo(0, parseInt(savedScroll, 10)), 100);
        sessionStorage.removeItem('newsScrollY');
    }
}

// Gérer le redimensionnement : recalculer la pagination et rester sur la même page si possible
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        const oldItems = getItemsPerPage();
        renderNewsPage(currentPage);
        // Si le nombre d'articles par page change, on reste sur la même page (ou on ajuste)
    }, 250);
});

// Initialiser au chargement
if (document.getElementById('news-list-full')) {
    initNewsPage();
}

// Dans la fonction loadArticle, après le chargement de l'article
const backButton = document.getElementById('backButton');
if (backButton) {
    backButton.addEventListener('click', (e) => {
        e.preventDefault();
        const savedPage = sessionStorage.getItem('newsPage');
        if (savedPage) {
            window.location.href = `actualites.html?page=${savedPage}`;
        } else {
            window.location.href = 'actualites.html';
        }
    });
}

// ===== BANDEAU DE CONSENTEMENT COOKIES =====
document.addEventListener('DOMContentLoaded', function() {
    // Vérifie si l'utilisateur a déjà fait un choix
    const consent = localStorage.getItem('cookieConsent');
    /*if (consent) return;*/ // déjà répondu, on ne réaffiche pas

    // Création du bandeau
    const banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.innerHTML = `
        <div class="cookie-banner-content">
            <p>Ce site utilise des cookies techniques nécessaires à son bon fonctionnement (session, mémorisation de votre consentement). Aucune donnée personnelle n'est partagée à des fins publicitaires ou analytiques. En acceptant, vous autorisez le dépôt de ces cookies. En refusant, certaines fonctionnalités pourraient être limitées (ex. : le bandeau réapparaîtra à chaque visite).</p>
            <div class="cookie-buttons">
                <button id="cookie-accept" class="cookie-btn accept">Accepter</button>
                <button id="cookie-refuse" class="cookie-btn refuse">Refuser</button>
            </div>
        </div>
    `;
    banner.style.position = 'fixed';
    banner.style.bottom = '0';
    banner.style.left = '0';
    banner.style.width = '100%';
    banner.style.backgroundColor = 'rgba(0,0,0,0.95)';
    banner.style.color = '#fff';
    banner.style.padding = '1rem';
    banner.style.zIndex = '10000';
    banner.style.fontFamily = 'Manrope, sans-serif';
    banner.style.fontSize = '0.9rem';
    banner.style.backdropFilter = 'blur(5px)';
    banner.style.borderTop = '1px solid rgba(189,143,40,0.3)';

    const innerDiv = banner.querySelector('.cookie-banner-content');
    innerDiv.style.maxWidth = '1200px';
    innerDiv.style.margin = '0 auto';
    innerDiv.style.display = 'flex';
    innerDiv.style.flexWrap = 'wrap';
    innerDiv.style.justifyContent = 'space-between';
    innerDiv.style.alignItems = 'center';
    innerDiv.style.gap = '1rem';

    const btnContainer = banner.querySelector('.cookie-buttons');
    btnContainer.style.display = 'flex';
    btnContainer.style.gap = '1rem';

    const acceptBtn = document.getElementById('cookie-accept');
    const refuseBtn = document.getElementById('cookie-refuse');
    acceptBtn.style.backgroundColor = '#BD8F28';
    acceptBtn.style.border = 'none';
    acceptBtn.style.padding = '0.5rem 1.5rem';
    acceptBtn.style.borderRadius = '40px';
    acceptBtn.style.color = 'white';
    acceptBtn.style.fontWeight = '600';
    acceptBtn.style.cursor = 'pointer';
    acceptBtn.style.transition = 'all 0.2s';
    refuseBtn.style.backgroundColor = '#444';
    refuseBtn.style.border = 'none';
    refuseBtn.style.padding = '0.5rem 1.5rem';
    refuseBtn.style.borderRadius = '40px';
    refuseBtn.style.color = 'white';
    refuseBtn.style.fontWeight = '600';
    refuseBtn.style.cursor = 'pointer';
    refuseBtn.style.transition = 'all 0.2s';

    acceptBtn.addEventListener('mouseenter', () => {
        acceptBtn.style.backgroundColor = '#9e7621';
        acceptBtn.style.transform = 'translateY(-2px)';
    });
    acceptBtn.addEventListener('mouseleave', () => {
        acceptBtn.style.backgroundColor = '#BD8F28';
        acceptBtn.style.transform = 'translateY(0)';
    });
    refuseBtn.addEventListener('mouseenter', () => {
        refuseBtn.style.backgroundColor = '#666';
        refuseBtn.style.transform = 'translateY(-2px)';
    });
    refuseBtn.addEventListener('mouseleave', () => {
        refuseBtn.style.backgroundColor = '#444';
        refuseBtn.style.transform = 'translateY(0)';
    });

    document.body.appendChild(banner);

    // Actions des boutons
    acceptBtn.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'accepted');
        banner.remove();
    });
    refuseBtn.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'refused');
        banner.remove();
    });
})();