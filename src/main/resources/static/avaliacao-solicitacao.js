// Sistema de avaliação mútua para solicitações

async function showEvaluationModal(requestId, solicitacaoData = null) {
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('Token não encontrado para avaliação');
        return;
    }

    try {
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
            console.error('Solicitação não encontrada');
            return;
        }
        
        // Determinar quem deve ser avaliado
        const isDoador = solicitacao.doacao?.doador?.id === currentUser.id;
        const avaliadoId = isDoador 
            ? solicitacao.solicitante?.id 
            : solicitacao.doacao?.doador?.id;

        if (!avaliadoId) {
            console.error('Não foi possível determinar quem avaliar');
            return;
        }

        // Verificar se já avaliou
        const jaAvaliou = avaliacoesExistentes.some(a => a.avaliador && a.avaliador.id === currentUser.id);
        
        if (jaAvaliou) {
            // Mostrar avaliação existente
            showExistingEvaluationModal(avaliacoesExistentes.find(a => a.avaliador && a.avaliador.id === currentUser.id));
            return;
        }

        // Mostrar modal de avaliação
        createEvaluationModal(requestId, avaliadoId, solicitacao);
    } catch (error) {
        console.error('Erro ao preparar avaliação:', error);
    }
}

function createEvaluationModal(requestId, avaliadoId, solicitacao) {
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

    let selectedRating = 0;
    let commentText = '';

    const avaliadoNome = solicitacao.doacao?.doador?.id === avaliadoId 
        ? solicitacao.doacao?.doador?.nome 
        : solicitacao.solicitante?.nome || 'Usuário';

    modal.innerHTML = `
        <div style="background: white; border-radius: 20px; padding: 2rem; max-width: 500px; width: 100%;">
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <h2 style="margin: 0 0 0.5rem 0; color: #667eea;">
                    <i class="fas fa-star"></i> Avaliar ${avaliadoNome}
                </h2>
                <p style="color: #64748b; margin: 0;">
                    Como foi sua experiência com esta doação?
                </p>
            </div>

            <div style="margin-bottom: 1.5rem;">
                <label style="display: block; margin-bottom: 0.5rem; color: #1e293b; font-weight: 600;">
                    Nota (1 a 5 estrelas)
                </label>
                <div class="rating-stars" style="display: flex; justify-content: center; gap: 0.5rem; font-size: 2rem;">
                    ${[1, 2, 3, 4, 5].map(i => `
                        <i class="fas fa-star star-rating" data-rating="${i}" 
                           style="color: #d1d5db; cursor: pointer; transition: all 0.2s;">
                        </i>
                    `).join('')}
                </div>
                <p id="rating-text" style="text-align: center; margin-top: 0.5rem; color: #64748b; font-size: 0.9rem;">
                    Selecione uma nota
                </p>
            </div>

            <div style="margin-bottom: 1.5rem;">
                <label style="display: block; margin-bottom: 0.5rem; color: #1e293b; font-weight: 600;">
                    Comentário (opcional)
                </label>
                <textarea id="evaluation-comment" 
                          placeholder="Deixe um comentário sobre sua experiência..."
                          style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 10px; font-family: inherit; resize: vertical; min-height: 100px;">
                </textarea>
            </div>

            <div style="display: flex; gap: 1rem;">
                <button id="submit-evaluation" 
                        style="flex: 1; padding: 0.75rem; background: #667eea; color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.3s;">
                    <i class="fas fa-check"></i> Enviar Avaliação
                </button>
                <button id="skip-evaluation" 
                        style="padding: 0.75rem 1.5rem; background: #e5e7eb; color: #64748b; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.3s;">
                    Pular
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Event listeners para estrelas
    const stars = modal.querySelectorAll('.star-rating');
    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            selectedRating = index + 1;
            updateStars(stars, selectedRating);
            updateRatingText(selectedRating);
        });
        star.addEventListener('mouseenter', () => {
            updateStars(stars, index + 1, true);
        });
    });

    modal.querySelector('.rating-stars').addEventListener('mouseleave', () => {
        updateStars(stars, selectedRating);
    });

    // Event listener para enviar
    modal.querySelector('#submit-evaluation').addEventListener('click', async () => {
        if (selectedRating === 0) {
            alert('Por favor, selecione uma nota.');
            return;
        }

        commentText = modal.querySelector('#evaluation-comment').value;

        await submitEvaluation(requestId, avaliadoId, selectedRating, commentText);
        modal.remove();
    });

    // Event listener para pular
    modal.querySelector('#skip-evaluation').addEventListener('click', () => {
        modal.remove();
    });

    // Fechar ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function updateStars(stars, rating, isHover = false) {
    stars.forEach((star, index) => {
        if (index < rating) {
            star.style.color = '#fbbf24';
            star.classList.add('fas');
            star.classList.remove('far');
        } else {
            star.style.color = '#d1d5db';
            star.classList.add('far');
            star.classList.remove('fas');
        }
    });
}

function updateRatingText(rating) {
    const texts = {
        1: 'Muito Ruim',
        2: 'Ruim',
        3: 'Regular',
        4: 'Bom',
        5: 'Excelente'
    };
    const textEl = document.getElementById('rating-text');
    if (textEl) {
        textEl.textContent = texts[rating] || 'Selecione uma nota';
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
            alert('Avaliação enviada com sucesso!');
        } else {
            const error = await response.text();
            alert(`Erro ao enviar avaliação: ${error}`);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao enviar avaliação. Tente novamente.');
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

