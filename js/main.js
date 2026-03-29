// Initialisation AOS
AOS.init({
    duration: 800,
    once: true,
    offset: 100
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

// Fermer le menu lors du clic sur un lien
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        if (navLinks.classList.contains('nav-active')) {
            toggleMenu();
        }
    });
});

// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (navbar) {
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255,255,255,0.98)';
            navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
        } else {
            navbar.style.background = 'rgba(255,255,255,0.98)';
            navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        }
    }
});

// Gestion du formulaire de contact
const contactForm = document.getElementById('contactForm');
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
        
        const statusDiv = document.getElementById('formStatus');
        statusDiv.style.display = 'block';
        statusDiv.className = 'form-status';
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
                statusDiv.textContent = result.message || 'Message envoyé avec succès !';
                contactForm.reset();
            } else {
                statusDiv.className = 'form-status error';
                statusDiv.textContent = result.error || 'Une erreur est survenue.';
            }
        } catch (error) {
            statusDiv.className = 'form-status error';
            statusDiv.textContent = 'Erreur réseau. Veuillez réessayer plus tard.';
        }
        
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 5000);
    });
}

// Smooth scroll pour les ancres
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});