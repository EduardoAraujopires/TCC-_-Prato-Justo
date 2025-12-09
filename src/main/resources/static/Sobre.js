/**
 * Sobre.js - Sistema de controle da página "Sobre Nós"
 * Gerencia animações, interações e controle de elementos baseado no estado de autenticação
 * @version 1.0.0
 */

// Animação de scroll para as seções
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Sobre.js inicializado');

    // ============================================
    // 1. SISTEMA DE ANIMAÇÕES
    // ============================================

    /**
     * Configura observador de interseção para animações
     * Anima elementos quando entram na viewport
     */
    const initAnimations = () => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate__active');
                    // Opcional: para animação única
                    // observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observar todos os elementos com data-animate
        document.querySelectorAll('[data-animate]').forEach(el => {
            observer.observe(el);
        });

        console.log('🎬 Sistema de animações inicializado');
    };

    // ============================================
    // 2. SISTEMA DE AUTENTICAÇÃO
    // ============================================

    /**
     * Verifica se o usuário está autenticado
     * @returns {boolean} True se usuário estiver logado
     */
    const checkAuthentication = () => {
        // Métodos de verificação em ordem de prioridade
        const authMethods = [
            // 1. Token JWT direto (seu sistema usa 'token')
            () => localStorage.getItem('token'),

            // 2. Flag de login explícita
            () => localStorage.getItem('isLoggedIn') === 'true',

            // 3. Dados do usuário com flag
            () => {
                const userData = localStorage.getItem('userData');
                if (!userData) return false;
                try {
                    const parsed = JSON.parse(userData);
                    return parsed.loggedIn === true || parsed.isLoggedIn === true;
                } catch {
                    return false;
                }
            },

            // 4. SessionStorage como fallback
            () => sessionStorage.getItem('token') ||
                   sessionStorage.getItem('isLoggedIn') === 'true'
        ];

        // Tenta cada método até encontrar um válido
        for (const method of authMethods) {
            try {
                if (method()) {
                    console.log('✅ Usuário autenticado');
                    return true;
                }
            } catch (error) {
                console.warn('⚠️ Erro ao verificar método de autenticação:', error);
                continue;
            }
        }

        console.log('❌ Usuário não autenticado');
        return false;
    };

    // ============================================
    // 3. CONTROLE DO BOTÃO "SEJA PARCEIRO"
    // ============================================

    /**
     * Gerencia a visibilidade e comportamento do botão "Seja Parceiro"
     */
    const managePartnerButton = () => {
        const partnerBtn = document.getElementById('sejaParceiroBtn');

        if (!partnerBtn) {
            console.warn('⚠️ Botão "Seja Parceiro" não encontrado no DOM');
            return;
        }

        const isAuthenticated = checkAuthentication();

        // Controle de visibilidade
        if (isAuthenticated) {
            // Usuário LOGADO: oculta o botão elegantemente
            partnerBtn.classList.add('btn--hidden');
            partnerBtn.setAttribute('aria-hidden', 'true');
            partnerBtn.setAttribute('tabindex', '-1');

            // Anima a saída do botão
            setTimeout(() => {
                partnerBtn.style.display = 'none';
                partnerBtn.style.visibility = 'hidden';
                partnerBtn.style.opacity = '0';
                partnerBtn.style.transform = 'scale(0.8)';
                partnerBtn.style.height = '0';
                partnerBtn.style.padding = '0';
                partnerBtn.style.margin = '0';
                partnerBtn.style.overflow = 'hidden';
            }, 300);

            console.log('🚫 Botão "Seja Parceiro" ocultado (usuário logado)');
        } else {
            // Usuário NÃO LOGADO: garante que o botão está visível
            partnerBtn.classList.remove('btn--hidden');
            partnerBtn.removeAttribute('aria-hidden');
            partnerBtn.setAttribute('tabindex', '0');

            partnerBtn.style.display = 'flex';
            partnerBtn.style.visibility = 'visible';
            partnerBtn.style.opacity = '1';
            partnerBtn.style.transform = 'scale(1)';
            partnerBtn.style.height = 'auto';
            partnerBtn.style.overflow = 'visible';

            // Configura o comportamento do clique
            setupPartnerButtonClick(partnerBtn);

            console.log('✅ Botão "Seja Parceiro" visível (usuário não logado)');
        }

        // Ajusta layout do container baseado no número de botões visíveis
        adjustButtonsLayout(isAuthenticated);
    };

    /**
     * Configura o evento de clique no botão "Seja Parceiro"
     * @param {HTMLElement} button - Elemento do botão
     */
    const setupPartnerButtonClick = (button) => {
        // Remove eventos anteriores para evitar duplicação
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        // Adiciona novo evento
        newButton.addEventListener('click', function(e) {
            e.preventDefault();

            if (checkAuthentication()) {
                // Se por algum motivo estiver autenticado, vai direto para cadastro
                console.log('🔗 Redirecionando para cadastro de perfil');
                window.location.href = 'cadastro_perfil.html';
            } else {
                // Não autenticado: redireciona para login
                console.log('🔐 Redirecionando para login');
                const redirectUrl = encodeURIComponent('cadastro_perfil.html');
                window.location.href = `login.html?redirect=${redirectUrl}`;
            }
        });
    };

    /**
     * Ajusta o layout dos botões CTA baseado na autenticação
     * @param {boolean} isAuthenticated - Se o usuário está logado
     */
    const adjustButtonsLayout = (isAuthenticated) => {
        const ctaContainer = document.querySelector('.cta-buttons-premium');
        if (!ctaContainer) return;

        if (isAuthenticated) {
            // Apenas "Quero Ajudar" visível - centraliza
            ctaContainer.classList.add('single-button');
            ctaContainer.classList.remove('multiple-buttons');
            ctaContainer.style.justifyContent = 'center';
            ctaContainer.style.textAlign = 'center';
        } else {
            // Ambos botões visíveis - layout lado a lado
            ctaContainer.classList.remove('single-button');
            ctaContainer.classList.add('multiple-buttons');
            ctaContainer.style.justifyContent = 'center';
            ctaContainer.style.textAlign = 'center';
        }
    };

    // ============================================
    // 4. SISTEMA DE SCROLL SUAVE
    // ============================================

    /**
     * Configura scroll suave para navegação interna
     */
    const initSmoothScroll = () => {
        const scrollIndicator = document.querySelector('.scroll-indicator-premium');
        if (scrollIndicator) {
            scrollIndicator.addEventListener('click', function() {
                const nextSection = document.querySelector('.missao-section-premium');
                if (nextSection) {
                    nextSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });

                    // Adiciona classe de foco temporária
                    nextSection.classList.add('section--focused');
                    setTimeout(() => {
                        nextSection.classList.remove('section--focused');
                    }, 2000);
                }
            });
        }
    };

    // ============================================
    // 5. MENU MOBILE
    // ============================================

    /**
     * Gerencia o menu mobile responsivo
     */
    const initMobileMenu = () => {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const navMenu = document.getElementById('nav-menu');
        const headerActions = document.getElementById('header-actions');
        const mobileOverlay = document.getElementById('mobile-overlay');

        if (!mobileMenuBtn || !navMenu) return;

        const toggleMenu = (isOpening) => {
            const wasExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
            const willBeExpanded = isOpening !== undefined ? isOpening : !wasExpanded;

            mobileMenuBtn.setAttribute('aria-expanded', willBeExpanded);
            navMenu.classList.toggle('active', willBeExpanded);

            if (headerActions) headerActions.classList.toggle('active', willBeExpanded);
            if (mobileOverlay) mobileOverlay.classList.toggle('active', willBeExpanded);

            document.body.style.overflow = willBeExpanded ? 'hidden' : 'auto';

            // Anima o ícone do hamburger
            const spans = mobileMenuBtn.querySelectorAll('span');
            if (spans.length === 3) {
                spans[0].style.transform = willBeExpanded ? 'rotate(45deg) translate(5px, 5px)' : 'none';
                spans[1].style.opacity = willBeExpanded ? '0' : '1';
                spans[2].style.transform = willBeExpanded ? 'rotate(-45deg) translate(7px, -6px)' : 'none';
            }
        };

        // Evento no botão do menu
        mobileMenuBtn.addEventListener('click', () => toggleMenu());

        // Evento no overlay (se existir)
        if (mobileOverlay) {
            mobileOverlay.addEventListener('click', () => toggleMenu(false));
        }

        // Fecha menu ao clicar em links (opcional)
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => toggleMenu(false));
        });

        // Fecha menu ao redimensionar para desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                toggleMenu(false);
            }
        });
    };

    // ============================================
    // 6. HEADER SCROLL EFFECT
    // ============================================

    /**
     * Adiciona efeito de scroll no header
     */
   /**
    * Adiciona efeito de scroll no header (VERSÃO FIXA)
    */
   const initHeaderScrollEffect = () => {
       const header = document.getElementById('main-header');
       if (!header) return;

       let lastScroll = 0;
       const headerHeight = header.offsetHeight;

       // Aplica padding inicial ao body baseado na altura do header
       document.body.style.paddingTop = headerHeight + 'px';

       window.addEventListener('scroll', function() {
           const currentScroll = window.pageYOffset;

           // Efeito de sombra ao descer (mas NÃO esconde o header)
           if (currentScroll > 50) {
               header.classList.add('scrolled');
           } else {
               header.classList.remove('scrolled');
           }

           // REMOVA ou COMENTE esta parte que esconde o header:
           /*
           if (currentScroll > lastScroll && currentScroll > 100) {
               // Descendo: esconde header - REMOVER para header fixo
               header.style.transform = 'translateY(-100%)';
           } else {
               // Subindo: mostra header
               header.style.transform = 'translateY(0)';
           }
           */

           lastScroll = currentScroll;
       });

       // Atualiza padding se a janela for redimensionada
       window.addEventListener('resize', function() {
           document.body.style.paddingTop = header.offsetHeight + 'px';
       });
   };

    // ============================================
    // 7. SISTEMA DE ATUALIZAÇÃO DINÂMICA
    // ============================================

    /**
     * Observa mudanças no estado de login
     */
    const initAuthStateObserver = () => {
        // Observa mudanças no localStorage
        window.addEventListener('storage', function(e) {
            if (e.key === 'token' || e.key === 'isLoggedIn' || e.key === 'userData') {
                console.log('🔄 Estado de autenticação alterado, atualizando...');
                setTimeout(managePartnerButton, 100);
            }
        });

        // Atualiza periodicamente (para SPA ou mudanças sem page reload)
        setInterval(() => {
            const partnerBtn = document.getElementById('sejaParceiroBtn');
            if (partnerBtn) {
                const shouldBeHidden = checkAuthentication();
                const isHidden = partnerBtn.style.display === 'none';

                if (shouldBeHidden !== isHidden) {
                    console.log('🔄 Atualizando estado do botão...');
                    managePartnerButton();
                }
            }
        }, 30000); // Verifica a cada 30 segundos
    };

    // ============================================
    // 8. INICIALIZAÇÃO DO SISTEMA
    // ============================================

    /**
     * Inicializa todos os sistemas
     */
    const initializeAllSystems = () => {
        initAnimations();
        initSmoothScroll();
        initMobileMenu();
        initHeaderScrollEffect();
        initAuthStateObserver();

        // Gerencia o botão "Seja Parceiro"
        managePartnerButton();

        // Executa novamente após delay para garantir
        setTimeout(managePartnerButton, 500);

        // Executa quando a página termina de carregar
        window.addEventListener('load', managePartnerButton);

        console.log('🚀 Todos os sistemas inicializados com sucesso');
    };

    // ============================================
    // EXECUÇÃO PRINCIPAL
    // ============================================

    // Inicializa tudo
    initializeAllSystems();

    // Exporta funções para debug (opcional)
    window.debugSobre = {
        checkAuth: checkAuthentication,
        manageButton: managePartnerButton,
        forceHideButton: () => {
            const btn = document.getElementById('sejaParceiroBtn');
            if (btn) btn.style.display = 'none';
        },
        forceShowButton: () => {
            const btn = document.getElementById('sejaParceiroBtn');
            if (btn) btn.style.display = 'flex';
        }
    };

});