// ==================== FONCTIONS UTILITAIRES ====================
function parseFrenchDate(dateStr) {
    const months = {
        'janvier': 0, 'février': 1, 'mars': 2, 'avril': 3, 'mai': 4, 'juin': 5,
        'juillet': 6, 'août': 7, 'septembre': 8, 'octobre': 9, 'novembre': 10, 'décembre': 11
    };
    const parts = dateStr.split(' ');
    if (parts.length !== 3) return new Date(0);
    const day = parseInt(parts[0], 10);
    const month = months[parts[1].toLowerCase()];
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
}

// ==================== GESTION DES ACTUALITÉS (ACCUEIL) ====================
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
        document.querySelectorAll('#news-list .news-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.getAttribute('data-id');
                sessionStorage.setItem('newsPage', 1);
                sessionStorage.setItem('newsScrollY', window.scrollY);
                window.location.href = `article.html?id=${id}`;
            });
        });
    } catch (error) {
        console.error('Erreur chargement actualités accueil:', error);
        if (container) container.innerHTML = '<p>Impossible de charger les actualités.</p>';
    }
}

// ==================== PAGINATION (PAGE ACTUALITÉS) ====================
let allArticles = [];
let currentPage = 1;
let totalPages = 1;

function getItemsPerPage() {
    const width = window.innerWidth;
    if (width >= 992) return 24;
    if (width >= 768) return 16;
    return 8;
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
    renderPagination();
    document.querySelectorAll('.news-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.getAttribute('data-id');
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
        sessionStorage.removeItem('newsPage');
    } else if (savedPage) {
        currentPage = parseInt(savedPage, 10);
        sessionStorage.removeItem('newsPage');
    } else {
        currentPage = 1;
    }
    const savedScroll = sessionStorage.getItem('newsScrollY');
    renderNewsPage(currentPage);
    if (savedScroll) {
        setTimeout(() => window.scrollTo(0, parseInt(savedScroll, 10)), 100);
        sessionStorage.removeItem('newsScrollY');
    }
}

// ==================== PAGE ARTICLE ====================
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
        const hero = document.getElementById('article-hero');
        if (hero) {
            hero.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8)), url('${article.image}')`;
            const heroTitle = hero.querySelector('.page-hero-content h1');
            if (heroTitle) heroTitle.textContent = article.title;
        }
        container.innerHTML = `<div class="article-meta">${article.date}</div><div class="article-body">${article.content}</div>`;
        const sameCategory = data.articles.filter(a => a.category === article.category && a.id != id);
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

// ==================== FORMULAIRE DE CONTACT ====================
function initContactForm() {
    const contactForm = document.getElementById('footer-contact-form');
    if (!contactForm) return;
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const privacyCheckbox = contactForm.querySelector('input[name="privacy_consent"]');
        if (privacyCheckbox && !privacyCheckbox.checked) {
            const statusDiv = contactForm.querySelector('.form-status');
            statusDiv.style.display = 'block';
            statusDiv.className = 'form-status error';
            statusDiv.textContent = 'Vous devez accepter la politique de confidentialité.';
            setTimeout(() => { statusDiv.style.display = 'none'; }, 5000);
            return;
        }
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

// ==================== COMPTEURS ANIMÉS ====================
function animateCounters() {
    const counters = document.querySelectorAll('.counter-number');
    if (!counters.length) return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-target'), 10);
                const duration = 2000;
                const step = Math.ceil(target / (duration / 30));
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
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(counter => observer.observe(counter));
}

// ==================== MENU BURGER ====================
function initMenu() {
    const burger = document.getElementById('burger');
    const navLinks = document.getElementById('navLinks');
    const menuOverlay = document.getElementById('menuOverlay');
    if (!burger || !navLinks) return;
    function toggleMenu() {
        navLinks.classList.toggle('nav-active');
        burger.classList.toggle('toggle');
        if (menuOverlay) menuOverlay.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    }
    burger.addEventListener('click', toggleMenu);
    if (menuOverlay) menuOverlay.addEventListener('click', toggleMenu);
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('nav-active')) toggleMenu();
        });
    });
}

// ==================== MASQUAGE DU MENU AU SCROLL ====================
function initScrollMenu() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 10) {
            navbar.classList.add('navbar-hidden');
        } else {
            navbar.classList.remove('navbar-hidden');
        }
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        lastScroll = currentScroll;
    });
}

// ==================== BANDEAU COOKIES ====================
function initCookieBanner() {
    if (localStorage.getItem('cookieConsent')) return;
    const banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.innerHTML = `
        <div class="cookie-banner-content">
            <p>🍪 Ce site utilise des cookies techniques nécessaires à son fonctionnement. Aucune donnée personnelle n'est partagée à des fins publicitaires ou analytiques. En acceptant, vous autorisez le dépôt de ces cookies. En refusant, certaines fonctionnalités pourraient être limitées.</p>
            <div class="cookie-buttons">
                <button id="cookie-accept" class="cookie-btn accept">Accepter</button>
                <button id="cookie-refuse" class="cookie-btn refuse">Refuser</button>
            </div>
        </div>
    `;
    document.body.appendChild(banner);
    const acceptBtn = document.getElementById('cookie-accept');
    const refuseBtn = document.getElementById('cookie-refuse');
    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'accepted');
            banner.remove();
        });
    }
    if (refuseBtn) {
        refuseBtn.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'refused');
            banner.remove();
        });
    }
}

// ==================== CHARGEMENT DU CONTENU JSON (textes modifiables) ====================
async function loadSiteContent() {
    try {
        const response = await fetch('/data/site-content.json');
        if (!response.ok) {
            console.warn('Fichier site-content.json non trouvé, utilisation du texte par défaut.');
            return;
        }
        const content = await response.json();

        // --- ACCUEIL ---
        if (document.querySelector('.hero-title')) {
            setText('.hero-title', content.accueil?.hero_title);
            setText('.hero-subtitle', content.accueil?.hero_subtitle);
            setText('.cta-banner h2', content.accueil?.cta_title);
            setText('.cta-banner p', content.accueil?.cta_text);
            const highlights = document.querySelectorAll('.highlight-card');
            if (highlights.length >= 3) {
                setText(highlights[0].querySelector('h3'), content.accueil?.highlight1_title);
                setText(highlights[0].querySelector('p'), content.accueil?.highlight1_text);
                setText(highlights[1].querySelector('h3'), content.accueil?.highlight2_title);
                setText(highlights[1].querySelector('p'), content.accueil?.highlight2_text);
                setText(highlights[2].querySelector('h3'), content.accueil?.highlight3_title);
                setText(highlights[2].querySelector('p'), content.accueil?.highlight3_text);
            }
            const counters = document.querySelectorAll('.counter-item');
            if (counters.length >= 4) {
                setText(counters[0].querySelector('.counter-label'), content.accueil?.counter1_label);
                setAttr(counters[0].querySelector('.counter-number'), 'data-target', content.accueil?.counter1_value);
                setText(counters[1].querySelector('.counter-label'), content.accueil?.counter2_label);
                setAttr(counters[1].querySelector('.counter-number'), 'data-target', content.accueil?.counter2_value);
                setText(counters[2].querySelector('.counter-label'), content.accueil?.counter3_label);
                setAttr(counters[2].querySelector('.counter-number'), 'data-target', content.accueil?.counter3_value);
                setText(counters[3].querySelector('.counter-label'), content.accueil?.counter4_label);
                setAttr(counters[3].querySelector('.counter-number'), 'data-target', content.accueil?.counter4_value);
            }
        }

        // --- MOUVEMENT ---
        if (document.querySelector('.movement-intro-grid')) {
            setText('.movement-text h2:first-of-type', content.mouvement?.histoire_titre);
            setText('.movement-text h2:first-of-type + p', content.mouvement?.histoire_texte);
            setText('.movement-text h2:nth-of-type(2)', content.mouvement?.but_titre);
            setText('.movement-text h2:nth-of-type(2) + p', content.mouvement?.but_texte);
            const pillars = document.querySelectorAll('.pillar-card');
            if (pillars.length >= 4) {
                setText(pillars[0].querySelector('h3'), content.mouvement?.pilier1_titre);
                setText(pillars[0].querySelector('p'), content.mouvement?.pilier1_texte);
                setText(pillars[1].querySelector('h3'), content.mouvement?.pilier2_titre);
                setText(pillars[1].querySelector('p'), content.mouvement?.pilier2_texte);
                setText(pillars[2].querySelector('h3'), content.mouvement?.pilier3_titre);
                setText(pillars[2].querySelector('p'), content.mouvement?.pilier3_texte);
                setText(pillars[3].querySelector('h3'), content.mouvement?.pilier4_titre);
                setText(pillars[3].querySelector('p'), content.mouvement?.pilier4_texte);
            }
            const antennesBlock = document.querySelector('.movement-antennes-grid .movement-block');
            if (antennesBlock) {
                const paras = antennesBlock.querySelectorAll('p');
                if (paras.length >= 3) {
                    setText(paras[0], content.mouvement?.antennes_texte);
                    if (content.mouvement?.antennes_commentaire) paras[1].innerHTML = content.mouvement.antennes_commentaire;
                    setText(paras[2], content.mouvement?.antennes_liste_villes);
                }
            }
        }

        // --- SOUTENIR ---
        if (document.querySelector('.support-intro')) {
            setText('.support-intro h2', content.soutenir?.intro_titre);
            setText('.support-intro p', content.soutenir?.intro_texte);
            const smallCards = document.querySelectorAll('.small-card');
            if (smallCards.length >= 3) {
                setText(smallCards[0].querySelector('h3'), content.soutenir?.boutique_titre);
                setText(smallCards[0].querySelector('p'), content.soutenir?.boutique_texte);
                setText(smallCards[1].querySelector('h3'), content.soutenir?.autocollants_titre);
                setText(smallCards[1].querySelector('p'), content.soutenir?.autocollants_texte);
                setText(smallCards[2].querySelector('h3'), content.soutenir?.journal_titre);
                setText(smallCards[2].querySelector('p'), content.soutenir?.journal_texte);
            }
            const introDons = document.getElementById('intro-dons');
            if (introDons) {
                setText(introDons.querySelector('h2'), content.soutenir?.don_intro_titre);
                setText(introDons.querySelector('p'), content.soutenir?.don_intro_texte);
            }
            setText('.donation-block h3', content.soutenir?.don_titre);
            const bonAsavoir = document.getElementById('bon-a-savoir');
            if (bonAsavoir) {
                setText(bonAsavoir.querySelector('h2'), content.soutenir?.bonasavoir_titre);
                const paras = bonAsavoir.querySelectorAll('p');
                if (paras.length >= 5) {
                    setText(paras[0], content.soutenir?.bonasavoir_paragraphe1);
                    setText(paras[1], content.soutenir?.bonasavoir_paragraphe2);
                    setText(paras[2], content.soutenir?.bonasavoir_paragraphe3);
                    setText(paras[3], content.soutenir?.bonasavoir_paragraphe4);
                    setText(paras[4], content.soutenir?.bonasavoir_paragraphe5);
                }
            }
        }

        // --- FAMILLE ROYALE ---
        if (document.querySelector('.royal-intro')) {
            setText('.page-hero-content h1', content.famille_royale?.hero_title);
            setText('.page-hero-content p', content.famille_royale?.hero_subtitle);
            setText('.royal-bio h2', content.famille_royale?.bio_titre);
            const bioParas = document.querySelectorAll('.royal-bio p');
            if (bioParas.length >= 3) {
                setText(bioParas[0], content.famille_royale?.bio_paragraphe1);
                setText(bioParas[1], content.famille_royale?.bio_paragraphe2);
                setText(bioParas[2], content.famille_royale?.bio_paragraphe3);
            }
            const quote = document.querySelector('.royal-quote');
            if (quote) {
                setText(quote.querySelector('p'), content.famille_royale?.citation_texte);
                setText(quote.querySelector('cite'), content.famille_royale?.citation_auteur);
            }
            setText('.royal-children h3', content.famille_royale?.enfants_titre);
            const childCards = document.querySelectorAll('.child-card');
            if (childCards.length >= 4) {
                setText(childCards[0].querySelector('h4'), content.famille_royale?.enfant1_nom);
                setText(childCards[0].querySelector('p'), content.famille_royale?.enfant1_desc);
                setText(childCards[1].querySelector('h4'), content.famille_royale?.enfant2_nom);
                setText(childCards[1].querySelector('p'), content.famille_royale?.enfant2_desc);
                setText(childCards[2].querySelector('h4'), content.famille_royale?.enfant3_nom);
                setText(childCards[2].querySelector('p'), content.famille_royale?.enfant3_desc);
                setText(childCards[3].querySelector('h4'), content.famille_royale?.enfant4_nom);
                setText(childCards[3].querySelector('p'), content.famille_royale?.enfant4_desc);
            }
            const claim = document.querySelector('.royal-claim');
            if (claim) {
                setText(claim.querySelector('h3'), content.famille_royale?.legitimite_titre);
                const claimParas = claim.querySelectorAll('p');
                if (claimParas.length >= 2) {
                    setText(claimParas[0], content.famille_royale?.legitimite_paragraphe1);
                    setText(claimParas[1], content.famille_royale?.legitimite_paragraphe2);
                }
            }
        }

        // --- FOOTER ---
        if (document.querySelector('.footer-about p')) {
            setText('.footer-about p', content.footer?.association_description);
            const emailP = document.querySelector('.footer-contact p:first-of-type');
            if (emailP) emailP.innerHTML = `<i class="fas fa-envelope"></i> ${content.footer?.contact_email}`;
        }
    } catch (error) {
        console.error('Erreur chargement contenu JSON :', error);
    }
}

// Fonctions utilitaires pour le JSON
function setText(selector, text) {
    if (!text) return;
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (el && el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA') el.textContent = text;
}
function setAttr(selector, attr, value) {
    if (!value) return;
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (el) el.setAttribute(attr, value);
}

// ==================== INITIALISATION GLOBALE (UN SEUL ÉCOUTEUR) ====================
document.addEventListener('DOMContentLoaded', () => {
    // AOS
    AOS.init({ duration: 600, once: true, offset: 50, easing: 'ease-out' });
    
    // Bloc adhésion
    setTimeout(() => {
        const block = document.querySelector('.adhesion-block');
        if (block) {
            block.style.display = 'block';
            block.style.opacity = '1';
            block.style.transform = 'none';
        }
    }, 100);
    
    // Initialisations
    initMenu();
    initScrollMenu();
    initContactForm();
    animateCounters();
    initCookieBanner();
    
    // Chargement des actualités (accueil et page dédiée)
    if (document.getElementById('news-list')) loadHomeNews();
    if (document.getElementById('news-list-full')) initNewsPage();
    if (window.location.pathname.includes('article.html')) loadArticle();
    
    // Bouton retour actualités
    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.addEventListener('click', (e) => {
            e.preventDefault();
            const savedPage = sessionStorage.getItem('newsPage');
            window.location.href = savedPage ? `actualites.html?page=${savedPage}` : 'actualites.html';
        });
    }
    
    // CHARGEMENT DU CONTENU JSON (textes modifiables)
    loadSiteContent();
});