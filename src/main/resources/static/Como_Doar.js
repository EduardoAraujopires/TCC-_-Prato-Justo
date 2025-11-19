// =========================================
// JS ESPECÍFICO PARA A PÁGINA "COMO DOAR"
// =========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Página "Como Doar" carregada');

    // ===== ANIMAÇÕES DE SCROLL PARA ELEMENTOS =====
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                
                // Animação em cascata para elementos filhos
                const children = entry.target.querySelectorAll('[data-animate-child]');
                children.forEach((child, index) => {
                    setTimeout(() => {
                        child.classList.add('animate');
                    }, index * 150);
                });
            }
        });
    }, observerOptions);

    // Observar todos os elementos com data-animate
    document.querySelectorAll('[data-animate]').forEach(el => {
        observer.observe(el);
    });

    // ===== ANIMAÇÃO DE PASSOS EM SEQUÊNCIA =====
    function animateStepsInSequence() {
        const steps = document.querySelectorAll('.step-card');
        steps.forEach((step, index) => {
            setTimeout(() => {
                step.style.opacity = '0';
                step.style.transform = 'translateY(30px)';
                step.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                
                setTimeout(() => {
                    step.style.opacity = '1';
                    step.style.transform = 'translateY(0)';
                }, 100);
            }, index * 150);
        });
    }

    // Observar seção de passos
    const stepsSection = document.querySelector('.steps-section');
    if (stepsSection) {
        const stepsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateStepsInSequence();
                    stepsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        stepsObserver.observe(stepsSection);
    }

    // ===== FAQ ACORDEON =====
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Fechar todos os outros itens
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle do item clicado
            item.classList.toggle('active', !isActive);
        });
    });

    // ===== EFEITOS HOVER AVANÇADOS =====
    const interactiveElements = document.querySelectorAll('.step-card, .food-type-card, .benefit-card');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        });

        element.addEventListener('mouseleave', function() {
            this.style.transition = 'all 0.3s ease';
        });
    });

    // ===== EFEITO PARALLAX SUAVE NO HERO =====
    const hero = document.querySelector('.como-doar-hero');
    if (hero) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const heroContent = hero.querySelector('.hero-content-wrapper');
            if (heroContent && scrolled < hero.offsetHeight) {
                heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
                heroContent.style.opacity = 1 - (scrolled / hero.offsetHeight) * 0.5;
            }
        });
    }

    // ===== ANIMAÇÃO DE SHAPES FLUTUANTES =====
    const shapes = document.querySelectorAll('.shape');
    shapes.forEach((shape, index) => {
        const randomDelay = Math.random() * 2;
        const randomDuration = 6 + Math.random() * 4;
        shape.style.animationDelay = `${randomDelay}s`;
        shape.style.animationDuration = `${randomDuration}s`;
    });

    // ===== BOTÕES INTERATIVOS =====
    const ctaButtons = document.querySelectorAll('.cta-section .btn');
    ctaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Efeito de ripple
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                animation: ripple 0.6s linear;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                pointer-events: none;
            `;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Adicionar estilos dinâmicos para ripple
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // ===== VALIDAÇÃO DE AUTENTICAÇÃO PARA BOTÕES =====
    const authRequiredButtons = document.querySelectorAll('.require-auth');
    
    authRequiredButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            // Verificar se authManager está disponível
            if (window.authManager && !window.authManager.isAuthenticated()) {
                e.preventDefault();
                if (confirm('Você precisa estar logado para fazer uma doação.\n\nDeseja fazer login agora?')) {
                window.location.href = 'login.html';
                }
            }
        });
    });

    // ===== SMOOTH SCROLL PARA LINKS INTERNOS =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // ===== HEADER SCROLL EFFECT =====
    const header = document.querySelector('.header');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        lastScrollY = window.scrollY;
    });

    // ===== MENU MOBILE =====
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');
    const mobileOverlay = document.getElementById('mobile-overlay');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            const isActive = mobileMenuBtn.classList.toggle('open');
            navMenu.classList.toggle('active');
            mobileOverlay.classList.toggle('active');
            mobileMenuBtn.setAttribute('aria-expanded', isActive);
            document.body.style.overflow = isActive ? 'hidden' : '';
        });

        mobileOverlay.addEventListener('click', () => {
            mobileMenuBtn.classList.remove('open');
            navMenu.classList.remove('active');
            mobileOverlay.classList.remove('active');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        });
    }

    // ===== DROPDOWN INTERAÇÕES =====
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    
    dropdownToggles.forEach(toggle => {
        const dropdown = toggle.parentElement;
        const menu = dropdown.querySelector('.dropdown-menu');

        dropdown.addEventListener('mouseenter', () => {
            if (window.innerWidth > 768) {
                toggle.setAttribute('aria-expanded', 'true');
                menu.classList.add('show');
            }
        });

        dropdown.addEventListener('mouseleave', () => {
            if (window.innerWidth > 768) {
                toggle.setAttribute('aria-expanded', 'false');
                menu.classList.remove('show');
            }
        });

        toggle.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
                toggle.setAttribute('aria-expanded', !isExpanded);
                menu.classList.toggle('show');
            }
        });
    });

    // Fechar dropdowns ao clicar fora
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                menu.classList.remove('show');
                menu.previousElementSibling.setAttribute('aria-expanded', 'false');
            });
        }
    });

    // ===== ANIMAÇÃO DE CARDS DE ALIMENTOS =====
    function animateFoodCards() {
        const foodCards = document.querySelectorAll('.food-type-card');
        foodCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(30px)';
                card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 100);
            }, index * 100);
        });
    }

    // Observar seção de tipos de alimentos
    const foodTypesSection = document.querySelector('.food-types-section');
    if (foodTypesSection) {
        const foodObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateFoodCards();
                    foodObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        foodObserver.observe(foodTypesSection);
    }

    // ===== CONTADOR ANIMADO PARA NÚMEROS DOS PASSOS =====
    const stepNumbers = document.querySelectorAll('.step-number');
    stepNumbers.forEach((stepNum, index) => {
        stepNum.style.animationDelay = `${index * 0.2}s`;
    });

    console.log('✅ Página "Como Doar" totalmente inicializada!');
});
