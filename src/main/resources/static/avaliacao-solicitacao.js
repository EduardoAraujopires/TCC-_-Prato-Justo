// Sistema de avaliação mútua para solicitações

async function showEvaluationModal(requestId, solicitacaoData = null) {
    console.log('[Avaliação] showEvaluationModal chamado com requestId:', requestId);
    
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('[Avaliação] Token não encontrado para avaliação');
        alert('Você precisa estar logado para avaliar.');
        return;
    }

    try {
        console.log('[Avaliação] Buscando dados da solicitação...');
        // Verificar se já existe avaliação
        const avaliacoesResponse = await fetch(`/avaliacoes-solicitacao/solicitacao/${requestId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        let avaliacoesExistentes = [];
        if (avaliacoesResponse.ok) {
            avaliacoesExistentes = await avaliacoesResponse.json();
        }

        // Buscar informações do usuário atual
        const userResponse = await fetch('/api/user/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!userResponse.ok) {
            console.error('Erro ao buscar usuário');
            return;
        }

        const currentUser = await userResponse.json();
        
        // Se não temos dados da solicitação, buscar do endpoint específico
        let solicitacao = solicitacaoData;
        if (!solicitacao) {
            // Tentar buscar do endpoint específico
            const solicitacaoResponse = await fetch(`/doacoes/solicitacoes/${requestId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (solicitacaoResponse.ok) {
                solicitacao = await solicitacaoResponse.json();
            } else {
                // Fallback: buscar da lista de solicitações do usuário
                const minhasSolicitacoesResponse = await fetch('/doacoes/minhas-solicitacoes', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (minhasSolicitacoesResponse.ok) {
                    const minhasSolicitacoes = await minhasSolicitacoesResponse.json();
                    solicitacao = minhasSolicitacoes.find(s => s.id === requestId);
                }
            }
        }
        
        if (!solicitacao) {
            console.error('[Avaliação] Solicitação não encontrada para ID:', requestId);
            // Mesmo assim, tentar criar o modal com dados mínimos
            createEvaluationModal(requestId, null, null);
            return;
        }
        
        console.log('[Avaliação] Solicitação encontrada:', solicitacao);
        
        // Determinar quem deve ser avaliado
        const isDoador = solicitacao.doacao?.doador?.id === currentUser.id;
        const avaliadoId = isDoador 
            ? solicitacao.solicitante?.id 
            : solicitacao.doacao?.doador?.id;

        console.log('[Avaliação] isDoador:', isDoador, 'avaliadoId:', avaliadoId);

        if (!avaliadoId) {
            console.warn('[Avaliação] Não foi possível determinar quem avaliar, mas vou mostrar o modal mesmo assim');
            // Mostrar modal mesmo sem avaliadoId - o usuário pode não conseguir enviar, mas pelo menos vê o modal
            createEvaluationModal(requestId, null, solicitacao);
            return;
        }

        // Verificar se já avaliou
        const jaAvaliou = avaliacoesExistentes.some(a => a.avaliador && a.avaliador.id === currentUser.id);
        
        console.log('[Avaliação] Já avaliou?', jaAvaliou);
        
        if (jaAvaliou) {
            console.log('[Avaliação] Mostrando avaliação existente');
            // Mostrar avaliação existente
            showExistingEvaluationModal(avaliacoesExistentes.find(a => a.avaliador && a.avaliador.id === currentUser.id));
            return;
        }

        // Mostrar modal de avaliação
        console.log('[Avaliação] Criando modal de avaliação...');
        createEvaluationModal(requestId, avaliadoId, solicitacao);
    } catch (error) {
        console.error('[Avaliação] Erro ao preparar avaliação:', error);
        console.error('[Avaliação] Stack trace:', error.stack);
        // Mesmo com erro, tentar mostrar um modal básico
        console.log('[Avaliação] Tentando mostrar modal básico mesmo com erro...');
        try {
            createEvaluationModal(requestId, null, null);
        } catch (modalError) {
            console.error('[Avaliação] Erro ao criar modal básico:', modalError);
            // Último recurso: alert simples
            alert('Doação concluída! Você pode avaliar mais tarde na página de solicitações.');
        }
    }
}

function createEvaluationModal(requestId, avaliadoId, solicitacao) {
    console.log('[Avaliação] createEvaluationModal chamado com:', { requestId, avaliadoId, solicitacao });
    
    // Remover qualquer modal existente
    const existingModal = document.querySelector('.evaluation-modal');
    if (existingModal) {
        console.log('[Avaliação] Removendo modal existente');
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'evaluation-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10002;
        padding: 2rem;
        animation: fadeIn 0.3s ease;
    `;

    let selectedRating = 0;
    let commentText = '';

    // Tratar casos onde solicitacao pode ser null
    let avaliadoNome = 'Usuário';
    let doacaoTitulo = 'Doação';
    
    if (solicitacao) {
        if (solicitacao.doacao?.doador?.id === avaliadoId) {
            avaliadoNome = solicitacao.doacao?.doador?.nome || 'Doador';
        } else if (solicitacao.solicitante) {
            avaliadoNome = solicitacao.solicitante.nome || 'Solicitante';
        }
        doacaoTitulo = solicitacao.doacao?.titulo || 'Doação';
    }
    
    console.log('[Avaliação] Criando modal para:', { avaliadoNome, doacaoTitulo, requestId, avaliadoId });

    modal.innerHTML = `
        <div class="evaluation-modal-content" style="
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #991b1b 100%);
            border-radius: 24px;
            padding: 0;
            max-width: 600px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            overflow: hidden;
            animation: slideUp 0.4s ease;
            border: 1px solid rgba(220, 38, 38, 0.3);
        ">
            <!-- Header com gradiente do tema -->
            <div style="
                background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
                padding: 2.5rem 2rem 2rem 2rem;
                text-align: center;
                color: white;
                position: relative;
                overflow: hidden;
            ">
                <div style="
                    position: absolute;
                    top: -50px;
                    right: -50px;
                    width: 200px;
                    height: 200px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 50%;
                "></div>
                <div style="
                    position: absolute;
                    bottom: -30px;
                    left: -30px;
                    width: 150px;
                    height: 150px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 50%;
                "></div>
                <div style="position: relative; z-index: 1;">
                    <div style="
                        font-size: 4rem;
                        margin-bottom: 1rem;
                        animation: bounceIn 0.6s ease;
                    ">
                        🎉
                    </div>
                    <h2 style="
                        margin: 0 0 0.5rem 0;
                        font-size: 1.75rem;
                        font-weight: 700;
                        text-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    ">
                        Doação Concluída!
                    </h2>
                    <p style="
                        margin: 0;
                        font-size: 1rem;
                        opacity: 0.95;
                        font-weight: 300;
                    ">
                        Como foi sua experiência com <strong>${avaliadoNome}</strong>?
                    </p>
                    <p style="
                        margin: 0.5rem 0 0 0;
                        font-size: 0.85rem;
                        opacity: 0.85;
                        font-style: italic;
                    ">
                        "${doacaoTitulo}"
                    </p>
                </div>
            </div>

            <!-- Conteúdo -->
            <div style="
                background: white;
                padding: 2rem;
            ">
                <!-- Estrelas interativas -->
                <div style="margin-bottom: 2rem;">
                    <label style="
                        display: block;
                        margin-bottom: 1rem;
                        color: #1e293b;
                        font-weight: 600;
                        font-size: 1.1rem;
                        text-align: center;
                    ">
                        Avalie sua experiência
                    </label>
                    <div class="rating-stars" style="
                        display: flex;
                        justify-content: center;
                        gap: 0.75rem;
                        font-size: 3rem;
                        margin-bottom: 1rem;
                    ">
                        ${[1, 2, 3, 4, 5].map(i => `
                            <i class="far fa-star star-rating" data-rating="${i}" 
                               style="
                                   color: #d1d5db;
                                   cursor: pointer;
                                   transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                                   transform: scale(1);
                               ">
                            </i>
                        `).join('')}
                    </div>
                    <p id="rating-text" style="
                        text-align: center;
                        margin: 0;
                        color: #dc2626;
                        font-size: 1.1rem;
                        font-weight: 600;
                        min-height: 1.5rem;
                        transition: all 0.3s;
                    ">
                        Selecione uma nota
                    </p>
                </div>

                <!-- Comentário -->
                <div style="margin-bottom: 2rem;">
                    <label style="
                        display: block;
                        margin-bottom: 0.75rem;
                        color: #1e293b;
                        font-weight: 600;
                    ">
                        <i class="fas fa-comment" style="color: #dc2626; margin-right: 0.5rem;"></i>
                        Comentário (opcional)
                    </label>
                    <textarea id="evaluation-comment" 
                              placeholder="Conte como foi sua experiência com esta doação..."
                              style="
                                  width: 100%;
                                  padding: 1rem;
                                  border: 2px solid #e5e7eb;
                                  border-radius: 12px;
                                  font-family: inherit;
                                  resize: vertical;
                                  min-height: 120px;
                                  font-size: 0.95rem;
                                  transition: all 0.3s;
                              "
                              onfocus="this.style.borderColor='#dc2626'; this.style.boxShadow='0 0 0 3px rgba(220, 38, 38, 0.1)'"
                              onblur="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none'">
                    </textarea>
                </div>

                <!-- Botões -->
                <div style="display: flex; gap: 1rem;">
                    <button id="submit-evaluation" 
                            style="
                                flex: 1;
                                padding: 1rem 1.5rem;
                                background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
                                color: white;
                                border: none;
                                border-radius: 12px;
                                font-weight: 600;
                                font-size: 1rem;
                                cursor: pointer;
                                transition: all 0.3s;
                                box-shadow: 0 4px 15px rgba(220, 38, 38, 0.4);
                                opacity: 0.5;
                                pointer-events: none;
                            "
                            onmouseover="if(this.style.opacity !== '0.5') { this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(220, 38, 38, 0.5)'; }"
                            onmouseout="if(this.style.opacity !== '0.5') { this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(220, 38, 38, 0.4)'; }">
                        <i class="fas fa-check"></i> Enviar Avaliação
                    </button>
                    <button id="skip-evaluation" 
                            style="
                                padding: 1rem 1.5rem;
                                background: #f3f4f6;
                                color: #64748b;
                                border: none;
                                border-radius: 12px;
                                font-weight: 600;
                                font-size: 1rem;
                                cursor: pointer;
                                transition: all 0.3s;
                            "
                            onmouseover="this.style.background='#e5e7eb'; this.style.transform='translateY(-2px)'"
                            onmouseout="this.style.background='#f3f4f6'; this.style.transform='translateY(0)'">
                        Pular
                    </button>
                </div>
            </div>
        </div>
    `;

    console.log('[Avaliação] Adicionando modal ao DOM');
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Verificar se o modal foi adicionado
    setTimeout(() => {
        const checkModal = document.querySelector('.evaluation-modal');
        if (checkModal) {
            console.log('[Avaliação] ✅ Modal adicionado com sucesso ao DOM');
            console.log('[Avaliação] Modal visível?', checkModal.offsetParent !== null);
            console.log('[Avaliação] Modal z-index:', window.getComputedStyle(checkModal).zIndex);
        } else {
            console.error('[Avaliação] ❌ ERRO: Modal não foi adicionado ao DOM!');
        }
    }, 100);

    // Adicionar animações CSS
    if (!document.getElementById('evaluation-modal-styles')) {
        const style = document.createElement('style');
        style.id = 'evaluation-modal-styles';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(30px) scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
            @keyframes bounceIn {
                0% {
                    opacity: 0;
                    transform: scale(0.3);
                }
                50% {
                    opacity: 1;
                    transform: scale(1.1);
                }
                100% {
                    transform: scale(1);
                }
            }
            @keyframes starPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.2); }
            }
            .star-rating:hover {
                transform: scale(1.3) !important;
            }
            .star-rating.active {
                animation: starPulse 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }

    const submitBtn = modal.querySelector('#submit-evaluation');
    const skipBtn = modal.querySelector('#skip-evaluation');

    // Event listeners para estrelas com animações
    const stars = modal.querySelectorAll('.star-rating');
    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            selectedRating = index + 1;
            updateStars(stars, selectedRating);
            updateRatingText(selectedRating);
            
            // Animação de clique
            star.classList.add('active');
            setTimeout(() => star.classList.remove('active'), 300);
            
            // Habilitar botão de envio
            if (submitBtn) {
                submitBtn.style.opacity = '1';
                submitBtn.style.pointerEvents = 'auto';
                submitBtn.style.cursor = 'pointer';
            }
        });
        
        star.addEventListener('mouseenter', () => {
            updateStars(stars, index + 1, true);
        });
    });

    modal.querySelector('.rating-stars').addEventListener('mouseleave', () => {
        updateStars(stars, selectedRating);
    });

    // Event listener para enviar com animação
    if (submitBtn) {
        submitBtn.addEventListener('click', async () => {
            if (selectedRating === 0) {
                // Animação de shake
                submitBtn.style.animation = 'shake 0.5s';
                setTimeout(() => {
                    submitBtn.style.animation = '';
                }, 500);
                return;
            }

            if (!avaliadoId) {
                alert('Não foi possível determinar quem avaliar. Por favor, tente novamente mais tarde.');
                console.error('[Avaliação] avaliadoId não disponível para envio');
                return;
            }

            // Desabilitar botão e mostrar loading
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            submitBtn.style.opacity = '0.7';

            commentText = modal.querySelector('#evaluation-comment').value;

            try {
                console.log('[Avaliação] Enviando avaliação:', { requestId, avaliadoId, selectedRating });
                await submitEvaluation(requestId, avaliadoId, selectedRating, commentText);
                
                // Animação de sucesso
                showSuccessAnimation(modal);
                
                // Remover modal após animação
                setTimeout(() => {
                    modal.remove();
                    document.body.style.overflow = '';
                }, 2000);
            } catch (error) {
                console.error('[Avaliação] Erro ao enviar:', error);
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-check"></i> Enviar Avaliação';
                submitBtn.style.opacity = '1';
                alert('Erro ao enviar avaliação: ' + (error.message || 'Tente novamente.'));
            }
        });
    }

    // Event listener para pular
    if (skipBtn) {
        skipBtn.addEventListener('click', () => {
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                modal.remove();
                document.body.style.overflow = '';
            }, 300);
        });
    }

    // Fechar ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                modal.remove();
                document.body.style.overflow = '';
            }, 300);
        }
    });

    // Adicionar animação de shake
    if (!document.getElementById('evaluation-modal-styles').textContent.includes('shake')) {
        const style = document.getElementById('evaluation-modal-styles');
        style.textContent += `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-10px); }
                75% { transform: translateX(10px); }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
    }
}

function showSuccessAnimation(modal) {
    const content = modal.querySelector('.evaluation-modal-content');
    if (!content) return;

    // Criar efeito de confetti
    createConfetti();

    // Animação de sucesso
    content.style.animation = 'bounceIn 0.6s ease';
    content.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
            padding: 3rem 2rem;
            text-align: center;
            color: white;
            border-radius: 24px;
            box-shadow: 0 10px 30px rgba(220, 38, 38, 0.3);
        ">
            <div style="font-size: 5rem; margin-bottom: 1rem; animation: bounceIn 0.6s ease;">
                ✅
            </div>
            <h2 style="margin: 0 0 0.5rem 0; font-size: 2rem; font-weight: 700;">
                Avaliação Enviada!
            </h2>
            <p style="margin: 0; font-size: 1.1rem; opacity: 0.95;">
                Obrigado por sua avaliação!
            </p>
        </div>
    `;
}

function createConfetti() {
    const colors = ['#dc2626', '#991b1b', '#fbbf24', '#f59e0b', '#ef4444'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}%;
            top: -10px;
            border-radius: 50%;
            z-index: 10003;
            animation: confettiFall ${2 + Math.random() * 2}s linear forwards;
            pointer-events: none;
        `;
        document.body.appendChild(confetti);

        setTimeout(() => confetti.remove(), 4000);
    }

    // Adicionar animação de confetti se não existir
    if (!document.getElementById('confetti-animation')) {
        const style = document.createElement('style');
        style.id = 'confetti-animation';
        style.textContent = `
            @keyframes confettiFall {
                to {
                    transform: translateY(100vh) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

function updateStars(stars, rating, isHover = false) {
    stars.forEach((star, index) => {
        if (index < rating) {
            star.style.color = '#fbbf24';
            star.style.transform = 'scale(1.1)';
            star.classList.add('fas');
            star.classList.remove('far');
            // Efeito de brilho
            star.style.textShadow = '0 0 10px rgba(251, 191, 36, 0.5)';
        } else {
            star.style.color = '#d1d5db';
            star.style.transform = 'scale(1)';
            star.classList.add('far');
            star.classList.remove('fas');
            star.style.textShadow = 'none';
        }
    });
}

function updateRatingText(rating) {
    const texts = {
        1: { text: 'Muito Ruim', emoji: '😞', color: '#ef4444' },
        2: { text: 'Ruim', emoji: '😐', color: '#f59e0b' },
        3: { text: 'Regular', emoji: '🙂', color: '#fbbf24' },
        4: { text: 'Bom', emoji: '😊', color: '#dc2626' },
        5: { text: 'Excelente', emoji: '🌟', color: '#dc2626' }
    };
    const textEl = document.getElementById('rating-text');
    if (textEl) {
        const ratingData = texts[rating] || { text: 'Selecione uma nota', emoji: '', color: '#64748b' };
        textEl.innerHTML = `<span style="font-size: 1.5rem; margin-right: 0.5rem;">${ratingData.emoji}</span>${ratingData.text}`;
        textEl.style.color = ratingData.color;
        textEl.style.animation = 'bounceIn 0.3s ease';
    }
}

async function submitEvaluation(requestId, avaliadoId, nota, comentario) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Você precisa estar logado.');
        return;
    }

    try {
        const response = await fetch('/avaliacoes-solicitacao', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                solicitacaoId: requestId,
                avaliadoId: avaliadoId,
                nota: nota,
                comentario: comentario || null
            })
        });

        if (response.ok) {
            // Sucesso - não precisa mostrar alert, a animação já mostra
            return true;
        } else {
            const error = await response.text();
            throw new Error(error || 'Erro ao enviar avaliação');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert(`Erro ao enviar avaliação: ${error.message || 'Tente novamente.'}`);
        throw error;
    }
}

function showExistingEvaluationModal(avaliacao) {
    const modal = document.createElement('div');
    modal.className = 'evaluation-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10002;
        padding: 2rem;
    `;

    const starsHTML = Array(5).fill(0).map((_, i) => 
        i < avaliacao.nota 
            ? '<i class="fas fa-star" style="color: #fbbf24;"></i>'
            : '<i class="far fa-star" style="color: #d1d5db;"></i>'
    ).join('');

    modal.innerHTML = `
        <div style="background: white; border-radius: 20px; padding: 2rem; max-width: 500px; width: 100%;">
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <h2 style="margin: 0 0 0.5rem 0; color: #667eea;">
                    <i class="fas fa-check-circle"></i> Avaliação Enviada
                </h2>
            </div>

            <div style="text-align: center; margin-bottom: 1.5rem;">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">
                    ${starsHTML}
                </div>
                ${avaliacao.comentario ? `
                    <p style="color: #64748b; margin-top: 1rem; text-align: left; background: #f8f9fa; padding: 1rem; border-radius: 10px;">
                        "${avaliacao.comentario}"
                    </p>
                ` : ''}
            </div>

            <button onclick="this.closest('.evaluation-modal').remove()" 
                    style="width: 100%; padding: 0.75rem; background: #667eea; color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer;">
                Fechar
            </button>
        </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

