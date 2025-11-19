// Animação de scroll para as seções
document.addEventListener('DOMContentLoaded', function() {
    // Animação de entrada das seções
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);

    // Observar todos os elementos com data-animate
    document.querySelectorAll('[data-animate]').forEach(el => {
        observer.observe(el);
    });

    // Smooth scroll para a próxima seção
    const scrollIndicator = document.querySelector('.scroll-indicator-premium');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', function() {
            const nextSection = document.querySelector('.missao-section-premium');
            if (nextSection) {
                nextSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Botão "Seja Parceiro"
    const sejaParceiroBtn = document.getElementById('sejaParceiroBtn');
    if (sejaParceiroBtn) {
        sejaParceiroBtn.addEventListener('click', function() {
            alert('Obrigado pelo interesse em ser nosso parceiro! Em breve entraremos em contato.');
        });
    }

    // Menu mobile
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');
    const headerActions = document.getElementById('header-actions');
    const mobileOverlay = document.getElementById('mobile-overlay');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('active');
            headerActions.classList.toggle('active');
            mobileOverlay.classList.toggle('active');
            document.body.style.overflow = isExpanded ? 'auto' : 'hidden';
        });
    }

    // Fechar menu ao clicar no overlay
    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', function() {
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
            navMenu.classList.remove('active');
            headerActions.classList.remove('active');
            this.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    }

    // Header scroll effect
    window.addEventListener('scroll', function() {
        const header = document.getElementById('main-header');
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
});