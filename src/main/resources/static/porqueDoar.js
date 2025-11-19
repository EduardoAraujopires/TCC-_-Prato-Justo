// =========================================
// JS SUPER PREMIUM - POR QUE DOAR
// =========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Página "Por Que Doar" - Versão Premium Carregada');

    // ===== HERO SECTION - FUNCIONALIDADES =====
    function initHeroSection() {
        // Contadores animados para as estatísticas do hero
        const heroStatNumbers = document.querySelectorAll('.hero-stat-card .stat-number');

        heroStatNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-count'));
            let current = 0;
            const duration = 2000;
            const startTime = performance.now();

            function updateCounter(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Easing function suave
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                current = Math.floor(target * easeOutQuart);

                stat.textContent = current.toLocaleString('pt-BR');

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    stat.textContent = target.toLocaleString('pt-BR');
                }
            }

            // Iniciar contador quando elemento estiver visível
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            requestAnimationFrame(updateCounter);
                        }, 500);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            observer.observe(stat.closest('.hero-stat-card'));
        });

        // Smooth scroll para a seção de urgência
        const urgencyLink = document.querySelector('a[href="#urgencia"]');
        if (urgencyLink) {
            urgencyLink.addEventListener('click', function(e) {
                e.preventDefault();
                const targetSection = document.getElementById('urgencia');
                if (targetSection) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = targetSection.offsetTop - headerHeight - 20;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        }
    }

    // ===== TIMELINE INTERATIVA =====
    function initInteractiveTimeline() {
        const timelineItems = document.querySelectorAll('.timeline-item');
        const timelineProgress = document.querySelector('.timeline-progress');

        if (!timelineItems.length || !timelineProgress) return;

        let currentActive = 0;

        function updateTimeline(index) {
            // Atualizar progresso
            const progress = ((index + 1) / timelineItems.length) * 100;
            timelineProgress.style.setProperty('--progress-width', `${progress}%`);

            // Atualizar estados
            timelineItems.forEach((item, i) => {
                item.classList.toggle('active', i === index);
            });

            currentActive = index;
        }

        // Clique nos itens da timeline
        timelineItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                updateTimeline(index);
                playTimelineSound();
            });
        });

        // Auto-rotacionar a cada 5 segundos
        setInterval(() => {
            const nextIndex = (currentActive + 1) % timelineItems.length;
            updateTimeline(nextIndex);
        }, 5000);

        // Iniciar com o primeiro item ativo
        updateTimeline(0);
    }

    function playTimelineSound() {
        // Criar som de notificação sutil
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);

            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            console.log('Audio context não suportado');
        }
    }

    // ===== COMPARAÇÃO INTERATIVA =====
    function initInteractiveComparison() {
        const wasteCard = document.querySelector('.waste-card');
        const hungerCard = document.querySelector('.hunger-card');

        [wasteCard, hungerCard].forEach(card => {
            if (!card) return;

            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-10px) scale(1.05)';
                this.style.zIndex = '10';
            });

            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
                this.style.zIndex = '1';
            });

            card.addEventListener('click', function() {
                // Efeito de pulso
                this.style.animation = 'pulse 0.5s ease';
                setTimeout(() => {
                    this.style.animation = '';
                }, 500);

                // Mostrar estatística expandida
                showExpandedStats(this);
            });
        });
    }

    function showExpandedStats(card) {
        const isWaste = card.classList.contains('waste-card');
        const stats = isWaste ?
            "💡 125 mil toneladas de comida desperdiçada por dia poderiam alimentar 50 milhões de pessoas!" :
            "💡 33 milhões de pessoas com fome equivalem à população inteira de países como Peru ou Angola!";

        // Criar tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'stats-tooltip';
        tooltip.textContent = stats;
        tooltip.style.cssText = `
            position: absolute;
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 1rem;
            border-radius: 0.5rem;
            z-index: 1000;
            max-width: 300px;
            font-size: 0.875rem;
            animation: fadeIn 0.3s ease;
        `;

        const rect = card.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width/2 - 150}px`;
        tooltip.style.top = `${rect.top - 100}px`;

        document.body.appendChild(tooltip);

        setTimeout(() => {
            if (tooltip.parentNode) {
                tooltip.remove();
            }
        }, 3000);
    }

    // ===== BOTÃO DE URGÊNCIA E MODAL =====
    function initUrgencyButton() {
        const urgencyBtn = document.getElementById('urgencyDonateBtn');
        const donationModal = document.getElementById('donationModal');
        const closeModal = document.querySelector('.close-modal');
        const donationOptions = document.querySelectorAll('.donation-option');
        const confirmBtn = document.querySelector('.btn-confirm-donation');

        if (!urgencyBtn || !donationModal) return;

        // Botão de urgência
        urgencyBtn.addEventListener('click', () => {
            donationModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });

        // Fechar modal
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                donationModal.style.display = 'none';
                document.body.style.overflow = '';
            });
        }

        // Fechar modal ao clicar fora
        donationModal.addEventListener('click', (e) => {
            if (e.target === donationModal) {
                donationModal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });

        // Opções de doação
        if (donationOptions.length) {
            donationOptions.forEach(option => {
                option.addEventListener('click', function() {
                    donationOptions.forEach(opt => opt.classList.remove('active'));
                    this.classList.add('active');
                });
            });
        }

        // Confirmar doação
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                const selectedOption = document.querySelector('.donation-option.active');
                const optionType = selectedOption?.dataset.value || 'basic';

                // Animação de confirmação
                confirmBtn.innerHTML = '<i class="fas fa-check"></i> Doação Confirmada!';
                confirmBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                confirmBtn.disabled = true;

                setTimeout(() => {
                    donationModal.style.display = 'none';
                    document.body.style.overflow = '';

                    // Reset do botão
                    setTimeout(() => {
                        confirmBtn.innerHTML = '<i class="fas fa-hand-holding-heart"></i> Confirmar Doação';
                        confirmBtn.style.background = '';
                        confirmBtn.disabled = false;
                    }, 1000);

                    // Mostrar mensagem de agradecimento
                    showThankYouMessage(optionType);
                }, 1500);
            });
        }
    }

    function showThankYouMessage(optionType) {
        const messages = {
            basic: "🎉 Obrigado! Uma família será alimentada esta semana!",
            medium: "🎉 Incrível! Duas famílias terão comida na mesa!",
            large: "🎉 Fantástico! Cinco famílias agradecem sua generosidade!"
        };

        const notification = document.createElement('div');
        notification.className = 'donation-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-heart"></i>
                <div>
                    <h4>Doação Realizada!</h4>
                    <p>${messages[optionType]}</p>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.5s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 500);
        }, 5000);
    }

    // ===== BOTÃO FLUTUANTE =====
    function createFloatingButton() {
        const floatingBtn = document.createElement('button');
        floatingBtn.className = 'floating-btn pulse-glow';
        floatingBtn.innerHTML = '❤️';
        floatingBtn.title = 'Doar Agora - Ajude uma família';

        floatingBtn.addEventListener('click', () => {
            // Verificação simples de autenticação
            const isAuthenticated = localStorage.getItem('userAuthenticated') === 'true';

            if (!isAuthenticated) {
                if (confirm('Faça login para doar alimentos e transformar vidas!\n\nDeseja fazer login agora?')) {
                    window.location.href = 'login.html';
                }
            } else {
                window.location.href = 'cadastro_alimento.html';
            }
        });

        const floatingDiv = document.createElement('div');
        floatingDiv.className = 'floating-action';
        floatingDiv.appendChild(floatingBtn);

        document.body.appendChild(floatingDiv);
    }

    // ===== ANIMAÇÕES DE SCROLL =====
    function initScrollAnimations() {
        // Observador para elementos com data-animate
        const animateObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('[data-animate]').forEach(el => {
            animateObserver.observe(el);
        });

        // Observador para elementos com data-reveal
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');

                    // Animar filhos com delay
                    const children = entry.target.querySelectorAll('[data-reveal-child]');
                    children.forEach((child, index) => {
                        setTimeout(() => {
                            child.classList.add('revealed');
                        }, index * 200);
                    });
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('[data-reveal]').forEach(el => {
            revealObserver.observe(el);
        });
    }

    // ===== CONTADORES DA SEÇÃO HERO ORIGINAL =====
    function initOriginalCounters() {
        const statNumbers = document.querySelectorAll('.hero-stats .stat-number');
        let counted = false;

        function startCounting() {
            if (counted) return;

            statNumbers.forEach(stat => {
                const target = parseInt(stat.getAttribute('data-count'));
                let current = 0;
                const duration = 2000;
                const startTime = performance.now();

                function update(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);

                    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                    current = Math.floor(target * easeOutQuart);

                    stat.textContent = current.toLocaleString('pt-BR');

                    if (progress < 1) {
                        requestAnimationFrame(update);
                    } else {
                        stat.textContent = target.toLocaleString('pt-BR');
                    }
                }

                requestAnimationFrame(update);
            });
            counted = true;
        }

        const statsSection = document.querySelector('.hero-stats');
        if (statsSection) {
            const statsObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(startCounting, 500);
                    }
                });
            }, { threshold: 0.3 });

            statsObserver.observe(statsSection);
        }
    }

    // ===== BOTÃO COMPARTILHAR =====
    function initShareButton() {
        const shareBtn = document.querySelector('.share-cause-btn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                if (navigator.share) {
                    navigator.share({
                        title: 'Prato Justo - Combata a Fome com Solidariedade',
                        text: 'Junte-se a esta causa e ajude a transformar vidas através da doação de alimentos.',
                        url: window.location.href
                    });
                } else {
                    // Fallback para copiar link
                    navigator.clipboard.writeText(window.location.href).then(() => {
                        alert('Link copiado! Compartilhe esta causa incrível!');
                    }).catch(() => {
                        // Fallback mais simples
                        const tempInput = document.createElement('input');
                        tempInput.value = window.location.href;
                        document.body.appendChild(tempInput);
                        tempInput.select();
                        document.execCommand('copy');
                        document.body.removeChild(tempInput);
                        alert('Link copiado! Compartilhe esta causa incrível!');
                    });
                }
            });
        }
    }

    // ===== INICIALIZAÇÃO COMPLETA =====
    function initAllFeatures() {
        initHeroSection();
        initInteractiveTimeline();
        initInteractiveComparison();
        initUrgencyButton();
        createFloatingButton();
        initScrollAnimations();
        initOriginalCounters();
        initShareButton();

        console.log('✅ Todos os recursos premium inicializados!');
    }

    // INICIAR TUDO
    initAllFeatures();
});
// =========================================
// BENEFÍCIOS PREMIUM - INTERAÇÕES
// =========================================

function initBenefitsPremium() {
    console.log('🎯 Inicializando Benefícios Premium...');

    // Timeline Interativa
    initBenefitsTimeline();

    // Cards 3D Interativos
    init3DCards();

    // Calculadora de Impacto
    initImpactCalculator();

    // Estatísticas em Tempo Real
    initLiveStats();

    // Botões de Ação
    initBenefitsButtons();
}

function initBenefitsTimeline() {
    const timelineSteps = document.querySelectorAll('.timeline-step');
    const progressBar = document.querySelector('.timeline-progress-benefits');

    if (!timelineSteps.length || !progressBar) return;

    timelineSteps.forEach((step, index) => {
        step.addEventListener('click', () => {
            // Atualizar progresso
            const progress = ((index + 1) / timelineSteps.length) * 100;
            progressBar.style.width = `${progress}%`;

            // Atualizar estados
            timelineSteps.forEach(s => s.classList.remove('active'));
            step.classList.add('active');

            // Efeito sonoro
            playTimelineClick();
        });
    });

    // Auto-rotacionar
    let currentStep = 0;
    const timelineInterval = setInterval(() => {
        currentStep = (currentStep + 1) % timelineSteps.length;
        timelineSteps.forEach(s => s.classList.remove('active'));
        timelineSteps[currentStep].classList.add('active');

        const progress = ((currentStep + 1) / timelineSteps.length) * 100;
        progressBar.style.width = `${progress}%`;
    }, 4000);

    // Limpar intervalo quando a página não estiver visível
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            clearInterval(timelineInterval);
        }
    });
}

function init3DCards() {
    const benefitCards = document.querySelectorAll('.benefit-card-premium');

    benefitCards.forEach(card => {
        // Efeito de hover para dispositivos com mouse
        card.addEventListener('mouseenter', function() {
            if (window.innerWidth > 768) {
                this.style.transform = 'translateY(-10px)';
            }
        });

        card.addEventListener('mouseleave', function() {
            if (window.innerWidth > 768) {
                this.style.transform = 'translateY(0)';
            }
        });

        // Clique para mobile
        card.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                const inner = this.querySelector('.benefit-card-inner');
                const isFlipped = inner.style.transform === 'rotateY(180deg)';

                inner.style.transform = isFlipped ? 'rotateY(0deg)' : 'rotateY(180deg)';
            }
        });

        // Contadores nos cards
        const statNumber = card.querySelector('.stat-number');
        if (statNumber) {
            const target = parseInt(statNumber.getAttribute('data-count'));
            animateCounter(statNumber, target, 2000);
        }
    });
}

function initImpactCalculator() {
    const amountSlider = document.getElementById('donationAmount');
    const amountValue = document.getElementById('amountValue');
    const familiesFed = document.getElementById('familiesFed');
    const co2Saved = document.getElementById('co2Saved');
    const waterSaved = document.getElementById('waterSaved');

    if (!amountSlider) return;

    function updateCalculator() {
        const amount = parseInt(amountSlider.value);
        amountValue.textContent = `${amount} kg`;

        // Cálculos baseados em dados reais
        const families = Math.max(1, Math.floor(amount / 3)); // ~3kg por família por dia
        const co2 = Math.floor(amount * 1.5); // 1.5kg CO₂ por kg de comida não desperdiçada
        const water = Math.floor(amount * 100); // 100L água por kg de comida

        // Animar os números
        animateCounter(familiesFed, families, 1000);
        animateCounter(co2Saved, co2, 1000);
        animateCounter(waterSaved, water, 1000);
    }

    amountSlider.addEventListener('input', updateCalculator);
    updateCalculator(); // Inicializar
}

function initLiveStats() {
    const liveStats = document.querySelectorAll('.live-stat-number');

    liveStats.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-live-count'));
        animateCounter(stat, target, 2500);

        // Simular atualizações em tempo real
        setInterval(() => {
            const current = parseInt(stat.textContent.replace(/,/g, ''));
            const increment = Math.floor(Math.random() * 10) + 1;
            const newValue = current + increment;

            animateCounter(stat, newValue, 1000);
        }, 10000); // Atualizar a cada 10 segundos
    });
}

function initBenefitsButtons() {
    const startBtn = document.getElementById('startDonatingBtn');
    const learnBtn = document.getElementById('learnMoreBtn');

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            // Verificar autenticação
            const isAuthenticated = localStorage.getItem('userAuthenticated') === 'true';

            if (isAuthenticated) {
                window.location.href = 'cadastro_alimento.html';
            } else {
                if (confirm('Faça login para começar a doar e transformar vidas!\n\nDeseja fazer login agora?')) {
                    window.location.href = 'login.html';
                }
            }
        });
    }

    if (learnBtn) {
        learnBtn.addEventListener('click', () => {
            // Criar modal com histórias de impacto
            createImpactStoriesModal();
        });
    }
}

function createImpactStoriesModal() {
    const modal = document.createElement('div');
    modal.className = 'impact-stories-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(10px);
    `;

    modal.innerHTML = `
        <div class="stories-modal-content" style="
            background: linear-gradient(135deg, #1e293b, #0f172a);
            border-radius: 1.5rem;
            padding: 3rem;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            color: white;
            position: relative;
            border: 1px solid rgba(255,255,255,0.2);
        ">
            <button class="close-stories-modal" style="
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: none;
                border: none;
                color: white;
                font-size: 2rem;
                cursor: pointer;
            ">&times;</button>

            <h3 style="text-align: center; margin-bottom: 2rem; background: linear-gradient(135deg, #fbbf24, #ef4444); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                📖 Histórias de Impacto Real
            </h3>

            <div class="story-item" style="margin-bottom: 2rem; padding: 1.5rem; background: rgba(255,255,255,0.1); border-radius: 1rem;">
                <h4 style="color: #fbbf24; margin-bottom: 1rem;">🏠 Família Silva - São Paulo</h4>
                <p>"Graças às doações, conseguimos alimentar nossos três filhos durante o mês todo. Meu marido perdeu o emprego e estávamos desesperados..."</p>
                <div style="margin-top: 1rem; font-style: italic; color: #10b981;">- Maria Silva, mãe de 3 filhos</div>
            </div>

            <div class="story-item" style="margin-bottom: 2rem; padding: 1.5rem; background: rgba(255,255,255,0.1); border-radius: 1rem;">
                <h4 style="color: #fbbf24; margin-bottom: 1rem;">🛒 Mercado Bom Preço - Rio de Janeiro</h4>
                <p>"Doamos nossos excedentes diários e descobrimos que estamos ajudando 50 famílias. É gratificante ver que o que iria para o lixo está alimentando pessoas..."</p>
                <div style="margin-top: 1rem; font-style: italic; color: #10b981;">- João Santos, gerente</div>
            </div>

            <div class="story-item" style="padding: 1.5rem; background: rgba(255,255,255,0.1); border-radius: 1rem;">
                <h4 style="color: #fbbf24; margin-bottom: 1rem;">👵 Dona Marta - 72 anos</h4>
                <p>"Com a aposentadoria baixa, muitas vezes ficava sem comer para pagar remédios. Agora recebo uma cesta semanal que me dá dignidade..."</p>
                <div style="margin-top: 1rem; font-style: italic; color: #10b981;">- Marta Oliveira, aposentada</div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Fechar modal
    const closeBtn = modal.querySelector('.close-stories-modal');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

function playTimelineClick() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
        console.log('Audio context não suportado');
    }
}

// Função auxiliar para animar contadores
function animateCounter(element, target, duration) {
    let current = 0;
    const startTime = performance.now();
    const startValue = parseInt(element.textContent.replace(/,/g, '')) || 0;

    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function suave
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        current = Math.floor(startValue + (target - startValue) * easeOutQuart);

        element.textContent = current.toLocaleString('pt-BR');

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target.toLocaleString('pt-BR');
        }
    }

    requestAnimationFrame(updateCounter);
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar benefícios premium
    initBenefitsPremium();

    console.log('✅ Seção Benefícios Premium carregada com sucesso!');
});

// Adicionar ao seu initAllFeatures existente
function initAllFeatures() {
    // ... seu código existente ...

    initBenefitsPremium(); // Adicione esta linha

    console.log('✅ Todos os recursos premium inicializados!');
}