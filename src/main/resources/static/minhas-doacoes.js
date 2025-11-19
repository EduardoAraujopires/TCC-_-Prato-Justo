class MinhasDoacoesApp {
    constructor() {
        this.currentUser = null;
        this.myDonations = [];
        this.donationRequests = {}; // Map<doacaoId, solicitações>
        this.currentFilter = 'todas'; // todas, ativas, inativas, vencidas, urgentes
        this.init();
    }

    async init() {
        await this.checkAuth();
        if (this.currentUser) {
            this.setupEventListeners();
            this.setupRealtimeListeners();
            await this.loadMyDonations();
            this.calculateStats();
        }
    }

    setupRealtimeListeners() {
        // Escutar eventos de nova solicitação
        if (typeof window.realtimeManager !== 'undefined') {
            window.realtimeManager.on('novaSolicitacao', (data) => {
                // Verificar se a solicitação é para uma das doações do usuário
                if (data.doacao && data.doacao.doador && 
                    data.doacao.doador.id === this.currentUser.id) {
                    this.handleNewSolicitacao(data);
                }
            });

            window.realtimeManager.on('solicitacaoAceita', (data) => {
                this.handleSolicitacaoAceita(data);
            });

            window.realtimeManager.on('solicitacaoRecusada', (data) => {
                this.handleSolicitacaoRecusada(data);
            });
        }

        // Escutar eventos customizados
        window.addEventListener('novaSolicitacao', (e) => {
            if (e.detail && e.detail.doacao && e.detail.doacao.doador && 
                e.detail.doacao.doador.id === this.currentUser.id) {
                this.handleNewSolicitacao(e.detail);
            }
        });
    }

    handleNewSolicitacao(data) {
        // Mostrar notificação
        if (typeof showNotification === 'function') {
            showNotification(
                `Nova solicitação recebida para: ${data.doacao.titulo || 'sua doação'}`,
                'info',
                5000
            );
        }

        // Recarregar doações para mostrar nova solicitação
        this.loadMyDonations();
    }

    handleSolicitacaoAceita(data) {
        // Atualizar interface se necessário
        this.loadMyDonations();
    }

    handleSolicitacaoRecusada(data) {
        // Atualizar interface se necessário
        this.loadMyDonations();
    }

    async checkAuth() {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await fetch('/api/user/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    this.currentUser = await response.json();
                    this.showAuthenticatedContent();
                } else {
                    localStorage.removeItem('token');
                    this.showAuthRequired();
                }
            } catch (error) {
                console.error('Erro ao verificar autenticação:', error);
                localStorage.removeItem('token');
                this.showAuthRequired();
            }
        } else {
            this.showAuthRequired();
        }
    }

    showAuthenticatedContent() {
        document.getElementById('auth-required').style.display = 'none';
        document.getElementById('authenticated-content').style.display = 'block';
        
        const userName = document.getElementById('user-name');
        userName.textContent = this.currentUser.nome;
    }

    showAuthRequired() {
        document.getElementById('auth-required').style.display = 'block';
        document.getElementById('authenticated-content').style.display = 'none';
    }

    setupEventListeners() {
        // Logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('token');
                this.currentUser = null;
                this.showAuthRequired();
            });
        }

        // Filtros
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.currentTarget.dataset.filter;
                this.setFilter(filter);
            });
        });
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Atualizar botões ativos
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });

        // Filtrar e renderizar
        this.renderMyDonations();
    }

    getFilteredDonations() {
        if (this.currentFilter === 'todas') {
            return this.myDonations;
        }

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        return this.myDonations.filter(donation => {
            if (this.currentFilter === 'ativas') {
                return donation.ativo === true;
            }
            
            if (this.currentFilter === 'inativas') {
                return donation.ativo === false;
            }

            if (this.currentFilter === 'vencidas') {
                if (!donation.dataValidade) return false;
                const dataVal = new Date(donation.dataValidade + 'T00:00:00');
                dataVal.setHours(0, 0, 0, 0);
                return dataVal < hoje;
            }

            if (this.currentFilter === 'urgentes') {
                if (!donation.dataValidade) return false;
                const dataVal = new Date(donation.dataValidade + 'T00:00:00');
                dataVal.setHours(0, 0, 0, 0);
                const diasRestantes = Math.ceil((dataVal - hoje) / (1000 * 60 * 60 * 24));
                return diasRestantes >= 0 && diasRestantes <= 3;
            }

            return true;
        });
    }

    async loadMyDonations() {
        const loading = document.getElementById('loading');
        const container = document.getElementById('doacoes-container');
        const noDonations = document.getElementById('no-donations');

        loading.style.display = 'block';
        container.innerHTML = '';
        noDonations.style.display = 'none';

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/doacoes/minhas', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                this.myDonations = await response.json();
                // Carregar solicitações para cada doação
                await this.loadRequestsForAllDonations();
                this.renderMyDonations();
            } else if (response.status === 401) {
                localStorage.removeItem('token');
                this.showAuthRequired();
                return;
            } else {
                throw new Error('Erro ao carregar suas doações');
            }
        } catch (error) {
            console.error('Erro:', error);
            this.showError('Erro ao carregar suas doações. Tente novamente.');
        } finally {
            loading.style.display = 'none';
        }
    }

    async loadRequestsForAllDonations() {
        const token = localStorage.getItem('token');
        if (!token) return;

        for (const donation of this.myDonations) {
            try {
                const response = await fetch(`/doacoes/${donation.id}/solicitacoes`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    this.donationRequests[donation.id] = await response.json();
                }
            } catch (error) {
                console.error(`Erro ao carregar solicitações da doação ${donation.id}:`, error);
                this.donationRequests[donation.id] = [];
            }
        }
    }

    renderMyDonations() {
        const container = document.getElementById('doacoes-container');
        const noDonations = document.getElementById('no-donations');

        if (!container) return;

        container.innerHTML = '';

        const filteredDonations = this.getFilteredDonations();

        if (filteredDonations.length === 0) {
            if (noDonations) noDonations.style.display = 'block';
            return;
        }

        if (noDonations) noDonations.style.display = 'none';

        // Animação escalonada para os cards
        filteredDonations.forEach((donation, index) => {
            const card = this.createMyDonationCard(donation);
            
            // Configurar animação inicial
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            container.appendChild(card);
            
            // Animação de entrada escalonada
            setTimeout(() => {
                card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }

    createMyDonationCard(donation) {
        const card = document.createElement('div');
        card.className = 'doacao-card';

        // Formatação de datas
        let dataFormatada = 'Não informado';
        let diasRestantes = null;
        let statusClass = 'status-available';
        let statusText = 'Disponível';
        
        if (donation.dataValidade) {
            const dataValidade = new Date(donation.dataValidade + 'T00:00:00');
            dataFormatada = dataValidade.toLocaleDateString('pt-BR');
            
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            const dataVal = new Date(donation.dataValidade + 'T00:00:00');
            dataVal.setHours(0, 0, 0, 0);
            
            diasRestantes = Math.ceil((dataVal - hoje) / (1000 * 60 * 60 * 24));
            
            if (diasRestantes < 0) {
                statusClass = 'status-expired';
                statusText = 'Vencido';
            } else if (diasRestantes <= 3) {
                statusClass = 'status-urgent';
                statusText = 'Urgente';
            }
        }

        // Mapeamento de tipos de alimento
        const tipoLabels = {
            'INDUSTRIALIZADO': 'Industrializado',
            'COZIDO': 'Refeição Pronta',
            'CRU': 'Matéria-prima',
            'FRUTAS_VERDURAS': 'Frutas e Verduras',
            'LATICINIOS': 'Laticínios',
            'BEBIDAS': 'Bebidas',
            'PERECIVEL': 'Perecível',
            'NAO_PERECIVEL': 'Não Perecível',
            'PREPARADO': 'Preparado'
        };
        
        const tipoLabel = tipoLabels[donation.tipoAlimento] || donation.tipoAlimento || 'Alimento';
        
        // Carregar solicitações desta doação
        const requests = this.donationRequests[donation.id] || [];
        const pendingRequests = requests.filter(r => r.status === 'solicitada');
        const inProgressRequests = requests.filter(r => r.status === 'em_andamento');
        const completedRequests = requests.filter(r => r.status === 'concluida');
        
        // Verificar se há solicitações concluídas
        const hasCompletedRequests = completedRequests.length > 0;
        
        // Obter data de conclusão (data de atualização da solicitação concluída mais recente)
        let dataConclusao = null;
        if (hasCompletedRequests && completedRequests.length > 0) {
            // Ordenar por data de atualização (mais recente primeiro) e pegar a primeira
            const sortedCompleted = completedRequests
                .filter(r => r.dataAtualizacao)
                .sort((a, b) => {
                    const dateA = new Date(a.dataAtualizacao);
                    const dateB = new Date(b.dataAtualizacao);
                    return dateB - dateA; // Mais recente primeiro
                });
            if (sortedCompleted.length > 0) {
                dataConclusao = sortedCompleted[0].dataAtualizacao;
            }
        }
        
        // Status ativo/inativo e concluída
        let activeStatus = '';
        if (hasCompletedRequests) {
            activeStatus = `
                <span class="status-badge inactive" style="background: #6c757d; color: white; padding: 0.5rem 1rem; border-radius: 20px; font-weight: 600; font-size: 0.85rem;">
                    <i class="fas fa-pause-circle"></i> Inativa
                </span>
                <span class="status-badge completed" style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 0.5rem 1rem; border-radius: 20px; font-weight: 600; font-size: 0.85rem; margin-left: 0.5rem;">
                    <i class="fas fa-check-circle"></i> Concluída
                </span>
            `;
        } else {
            activeStatus = donation.ativo ? 
                '<span class="status-badge active">Ativa</span>' : 
                '<span class="status-badge inactive">Inativa</span>';
        }

        // Seção de solicitações
        let requestsSection = '';
        if (requests.length > 0) {
            requestsSection = `
                <div class="requests-section" style="margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                        <h4 style="margin: 0; color: #667eea; font-size: 1rem;">
                            <i class="fas fa-users"></i> Solicitações (${requests.length})
                        </h4>
                    </div>
                    ${pendingRequests.length > 0 ? `
                        <div style="margin-bottom: 0.5rem;">
                            <strong style="color: #856404;">Pendentes: ${pendingRequests.length}</strong>
                        </div>
                    ` : ''}
                    ${inProgressRequests.length > 0 ? `
                        <div style="margin-bottom: 0.5rem;">
                            <strong style="color: #084298;">Em Andamento: ${inProgressRequests.length}</strong>
                        </div>
                    ` : ''}
                    ${completedRequests.length > 0 ? `
                        <div style="margin-bottom: 0.5rem;">
                            <strong style="color: #0f5132;">Concluídas: ${completedRequests.length}</strong>
                        </div>
                    ` : ''}
                    ${!hasCompletedRequests ? `
                        <button class="btn-view-requests" onclick="event.stopPropagation(); viewRequests(${donation.id})" 
                                style="margin-top: 0.5rem; padding: 0.5rem 1rem; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 0.85rem;">
                            <i class="fas fa-eye"></i> Ver Solicitações
                        </button>
                    ` : ''}
                </div>
            `;
        }

        // Estrutura HTML do card (mesmo estilo de doacoes.js)
        card.innerHTML = `
            <!-- Imagem do Alimento -->
            <div class="doacao-image-container">
                ${donation.imagem ? 
                    `<img src="${donation.imagem}" alt="${donation.titulo || 'Alimento'}" class="doacao-image">` :
                    `<div class="doacao-image-placeholder">
                        <i class="fas fa-utensils"></i>
                    </div>`
                }
            </div>
            
            <!-- Header com Categoria e Status -->
            <div class="doacao-header">
                <div class="doacao-type">
                    <i class="fas fa-tag"></i>
                    <span>${tipoLabel}</span>
                </div>
                <div class="${statusClass}">${statusText}</div>
            </div>
            
            <!-- Corpo do Card -->
            <div class="doacao-body">
                <h3 class="doacao-title">${donation.titulo || 'Alimento para Doação'}</h3>
                <p class="doacao-description">${donation.descricao || 'Descrição não disponível'}</p>
                
                ${hasCompletedRequests ? `
                    <!-- Status da Doação Concluída -->
                    <div class="request-status-container" style="margin: 1rem 0; padding: 1rem; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 12px; border: 2px solid rgba(16, 185, 129, 0.2); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
                        <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 0.75rem;">
                            <span class="request-status-badge status-concluida" style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.9rem; font-weight: 600; background: linear-gradient(135deg, #10b981, #059669); color: white;">
                                <i class="fas fa-check-circle"></i>
                                Concluída
                            </span>
                        </div>
                        <div style="text-align: center; font-size: 0.85rem; color: #6c757d; font-weight: 500;">
                            <i class="fas fa-calendar-check" style="margin-right: 0.4rem;"></i> 
                            Concluída em: ${dataConclusao ? new Date(dataConclusao).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Data não informada'}
                        </div>
                    </div>
                ` : ''}
                
                <!-- Detalhes do Alimento -->
                <div class="doacao-details">
                    <div class="detail-item">
                        <i class="fas fa-balance-scale"></i>
                        <div>
                            <span class="detail-label">Quantidade</span>
                            <span class="detail-value">${donation.quantidade || 'N/A'}${donation.unidade ? ' ' + donation.unidade : ''}</span>
                        </div>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-calendar-alt"></i>
                        <div>
                            <span class="detail-label">Validade</span>
                            <span class="detail-value">${dataFormatada}</span>
                        </div>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-clock"></i>
                        <div>
                            <span class="detail-label">Restam</span>
                            <span class="detail-value">${diasRestantes !== null ? (diasRestantes >= 0 ? diasRestantes + ' dias' : 'Vencido') : 'Não informado'}</span>
                        </div>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <div>
                            <span class="detail-label">Local</span>
                            <span class="detail-value">${donation.cidade || 'Não informado'}</span>
                        </div>
                    </div>
                </div>
                ${requestsSection}
            </div>
            
            <!-- Footer com Status e Ações -->
            <div class="doacao-footer">
                <div style="display: flex; align-items: center; gap: 0.5rem; ${hasCompletedRequests ? 'justify-content: center; width: 100%;' : ''}">
                    ${activeStatus}
                </div>
                ${!hasCompletedRequests ? `
                    <div class="donation-actions" style="display: flex; gap: 0.5rem;">
                        <button class="btn-edit" onclick="event.stopPropagation(); editDonation(${donation.id})" title="Editar doação">
                            <i class="fas fa-edit"></i>
                            Editar
                        </button>
                        <button class="btn-delete" onclick="event.stopPropagation(); deleteDonation(${donation.id}, event)" title="Excluir doação">
                            <i class="fas fa-trash"></i>
                            Excluir
                        </button>
                    </div>
                ` : ''}
            </div>
        `;

        // Adicionar evento de clique para ver detalhes (exceto nos botões e se não estiver concluída)
        if (!hasCompletedRequests) {
            card.addEventListener('click', function(e) {
                if (!e.target.closest('.btn-edit') && !e.target.closest('.btn-delete') && !e.target.closest('.btn-view-requests')) {
                    window.location.href = `detalhes-alimento.html?id=${donation.id}`;
                }
            });
        } else {
            // Se estiver concluída, adicionar estilo para indicar que não é clicável
            card.style.cursor = 'default';
            card.style.opacity = '0.9';
        }

        return card;
    }

    calculateStats() {
        const totalDonations = this.myDonations.length;
        const activeDonations = this.myDonations.filter(d => d.ativo).length;
        const totalQuantity = this.myDonations.reduce((sum, d) => sum + (d.quantidade || 0), 0);

        document.getElementById('total-donations').textContent = totalDonations;
        document.getElementById('active-donations').textContent = activeDonations;
        document.getElementById('total-quantity').textContent = totalQuantity.toFixed(1);
    }

    showError(message) {
        const container = document.getElementById('doacoes-container');
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
            </div>
        `;
    }
}

// Funções globais para editar e excluir doações
async function editDonation(donationId) {
    // Redirecionar para página de cadastro com parâmetro de edição
    window.location.href = `cadastro_alimento.html?edit=${donationId}`;
}

async function deleteDonation(donationId, event) {
    // Confirmação mais amigável
    const confirmed = await showDeleteConfirmation(donationId);
    if (!confirmed) return;

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Você precisa estar logado para excluir uma doação.', 'error');
            return;
        }

        // Mostrar loading
        const deleteBtn = event ? event.target.closest('.btn-delete') : document.querySelector(`.btn-delete[onclick*="${donationId}"]`);
        const originalContent = deleteBtn ? deleteBtn.innerHTML : '';
        if (deleteBtn) {
            deleteBtn.disabled = true;
            deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Excluindo...';
        }

        const response = await fetch(`/doacoes/${donationId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok || response.status === 204) {
            showNotification('Doação excluída com sucesso!', 'success');
            
            // Remover card da lista sem recarregar página
            const card = deleteBtn.closest('.doacao-card');
            if (card) {
                card.style.transition = 'all 0.3s ease';
                card.style.opacity = '0';
                card.style.transform = 'translateY(-20px)';
                setTimeout(() => {
                    card.remove();
                    // Recarregar doações para atualizar estatísticas
                    if (window.minhasDoacoesApp) {
                        window.minhasDoacoesApp.loadMyDonations();
                        window.minhasDoacoesApp.calculateStats();
                    }
                }, 300);
            } else {
                // Fallback: recarregar página
                setTimeout(() => location.reload(), 1000);
            }
        } else {
            const errorText = await response.text();
            showNotification(`Erro ao excluir doação: ${errorText}`, 'error');
            deleteBtn.disabled = false;
            deleteBtn.innerHTML = originalContent;
        }
    } catch (error) {
        console.error('Erro:', error);
        showNotification('Erro ao excluir doação. Tente novamente.', 'error');
        const deleteBtn = event.target.closest('.btn-delete');
        if (deleteBtn) {
            deleteBtn.disabled = false;
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Excluir';
        }
    }
}

// Função para mostrar confirmação de exclusão
function showDeleteConfirmation(donationId) {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
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
            z-index: 10000;
            animation: fadeIn 0.2s ease;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                border-radius: 20px;
                padding: 2rem;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                animation: slideUp 0.3s ease;
            ">
                <div style="text-align: center; margin-bottom: 1.5rem;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #e74c3c; margin-bottom: 1rem;"></i>
                    <h3 style="margin: 0 0 0.5rem 0; color: #1e293b; font-size: 1.5rem;">Confirmar Exclusão</h3>
                    <p style="margin: 0; color: #64748b; line-height: 1.6;">
                        Tem certeza que deseja excluir esta doação? Esta ação não pode ser desfeita.
                    </p>
                </div>
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button id="confirm-delete" style="
                        background: #e74c3c;
                        color: white;
                        border: none;
                        padding: 0.75rem 2rem;
                        border-radius: 10px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    ">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                    <button id="cancel-delete" style="
                        background: #64748b;
                        color: white;
                        border: none;
                        padding: 0.75rem 2rem;
                        border-radius: 10px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    ">
                        Cancelar
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('#confirm-delete').addEventListener('click', () => {
            modal.remove();
            resolve(true);
        });
        
        modal.querySelector('#cancel-delete').addEventListener('click', () => {
            modal.remove();
            resolve(false);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                resolve(false);
            }
        });
    });
}

// Função auxiliar para mostrar notificações
function showNotification(message, type = 'info', duration = 3000) {
    // Verificar se já existe sistema de notificação (NotificationManager do notification.js)
    if (typeof window.notification !== 'undefined' && window.notification && typeof window.notification.show === 'function') {
        window.notification.show(message, type, duration);
        return;
    }
    
    // Criar notificação simples
    const notificationElement = document.createElement('div');
    const bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#e74c3c' : '#667eea';
    notificationElement.style.cssText = `
        position: fixed;
        top: 100px;
        right: 2rem;
        background: ${bgColor};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 10001;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
        display: flex;
        align-items: center;
        gap: 0.75rem;
    `;
    
    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    notificationElement.innerHTML = `
        <i class="fas ${icon}" style="font-size: 1.5rem;"></i>
        <span style="font-weight: 500;">${message}</span>
    `;
    
    document.body.appendChild(notificationElement);
    
    setTimeout(() => {
        notificationElement.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notificationElement.remove(), 300);
    }, duration);
}

// Função para visualizar e gerenciar solicitações de uma doação
async function viewRequests(donationId) {
    const token = localStorage.getItem('token');
    if (!token) {
        showNotification('Você precisa estar logado.', 'error');
        return;
    }

    try {
        const response = await fetch(`/doacoes/${donationId}/solicitacoes`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar solicitações');
        }

        const requests = await response.json();
        showRequestsModal(donationId, requests);
    } catch (error) {
        console.error('Erro:', error);
        showNotification('Erro ao carregar solicitações.', 'error');
    }
}

// Modal para gerenciar solicitações
function showRequestsModal(donationId, requests) {
    const modal = document.createElement('div');
    modal.className = 'requests-modal';
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
        z-index: 10000;
        padding: 2rem;
        overflow-y: auto;
    `;

    const statusLabels = {
        'solicitada': { text: 'Pendente', class: 'status-solicitada', icon: 'fa-clock' },
        'em_andamento': { text: 'Em Andamento', class: 'status-em-andamento', icon: 'fa-spinner' },
        'concluida': { text: 'Concluída', class: 'status-concluida', icon: 'fa-check-circle' },
        'cancelada': { text: 'Cancelada', class: 'status-cancelada', icon: 'fa-times-circle' }
    };

    let requestsHTML = '';
    if (requests.length === 0) {
        requestsHTML = '<p style="text-align: center; color: #64748b; padding: 2rem;">Nenhuma solicitação encontrada.</p>';
    } else {
        requestsHTML = requests.map(req => {
            const statusInfo = statusLabels[req.status] || statusLabels['solicitada'];
            const dataSolicitacao = req.dataSolicitacao 
                ? new Date(req.dataSolicitacao).toLocaleDateString('pt-BR')
                : 'Data não informada';

            let actionsHTML = '';
            if (req.status === 'solicitada') {
                actionsHTML = `
                    <button class="btn-accept" onclick="acceptRequest(${req.id}, ${donationId})" 
                            style="padding: 0.5rem 1rem; background: #10b981; color: white; border: none; border-radius: 8px; cursor: pointer; margin-right: 0.5rem;">
                        <i class="fas fa-check"></i> Aceitar
                    </button>
                    <button class="btn-reject" onclick="rejectRequest(${req.id}, ${donationId})" 
                            style="padding: 0.5rem 1rem; background: #e74c3c; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        <i class="fas fa-times"></i> Recusar
                    </button>
                `;
            } else if (req.status === 'em_andamento') {
                actionsHTML = `
                    <button class="btn-chat" onclick="openChat(${req.solicitante.id}, ${req.id})" 
                            style="padding: 0.5rem 1rem; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; margin-right: 0.5rem;">
                        <i class="fas fa-comments"></i> Chat
                    </button>
                    <button class="btn-collect" onclick="markAsCollected(${req.id}, ${donationId})" 
                            style="padding: 0.5rem 1rem; background: #10b981; color: white; border: none; border-radius: 8px; cursor: pointer; margin-right: 0.5rem;">
                        <i class="fas fa-check-circle"></i> Marcar como Coletada
                    </button>
                    <button class="btn-cancel" onclick="cancelRequest(${req.id}, ${donationId})" 
                            style="padding: 0.5rem 1rem; background: #e74c3c; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        <i class="fas fa-times-circle"></i> Cancelar
                    </button>
                `;
            }

            return `
                <div class="request-item" style="background: white; padding: 1rem; border-radius: 10px; margin-bottom: 1rem; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.75rem;">
                        <div>
                            <h4 style="margin: 0 0 0.25rem 0; color: #1e293b;">
                                <i class="fas fa-user"></i> ${req.solicitante.nome || 'Usuário'}
                            </h4>
                            <p style="margin: 0; color: #64748b; font-size: 0.85rem;">
                                <i class="fas fa-calendar"></i> Solicitado em: ${dataSolicitacao}
                            </p>
                        </div>
                        <span class="request-status-badge ${statusInfo.class}" style="padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">
                            <i class="fas ${statusInfo.icon}"></i> ${statusInfo.text}
                        </span>
                    </div>
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        ${actionsHTML}
                    </div>
                </div>
            `;
        }).join('');
    }

    modal.innerHTML = `
        <div style="background: white; border-radius: 20px; padding: 2rem; max-width: 600px; width: 100%; max-height: 80vh; overflow-y: auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h2 style="margin: 0; color: #667eea;">
                    <i class="fas fa-users"></i> Solicitações
                </h2>
                <button onclick="this.closest('.requests-modal').remove()" 
                        style="background: none; border: none; font-size: 1.5rem; color: #64748b; cursor: pointer; padding: 0.5rem;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="requests-list">
                ${requestsHTML}
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Fechar ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Função para aceitar solicitação
async function acceptRequest(requestId, donationId) {
    const token = localStorage.getItem('token');
    if (!token) {
        showNotification('Você precisa estar logado.', 'error');
        return;
    }

    try {
        const response = await fetch(`/doacoes/solicitacoes/${requestId}/aceitar`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            showNotification('Solicitação aceita com sucesso!', 'success');
            
            // Fechar modal e recarregar
            document.querySelector('.requests-modal')?.remove();
            
            // Notificar sistema de tempo real
            if (typeof notifySolicitacaoAceita === 'function') {
                notifySolicitacaoAceita(data);
            } else if (typeof window.realtimeManager !== 'undefined') {
                window.realtimeManager.notifySolicitacaoAceita(data);
            }
            
            // Recarregar doações
            if (window.minhasDoacoesApp) {
                await window.minhasDoacoesApp.loadMyDonations();
            }
            
            // Redirecionar para chat com o usuário que solicitou
            if (data.solicitante && data.solicitante.id) {
                // Salvar informações do solicitante no localStorage para uso no chat
                localStorage.setItem('chatUserInfo', JSON.stringify({
                    id: data.solicitante.id,
                    nome: data.solicitante.nome || data.solicitante.name,
                    email: data.solicitante.email
                }));
                
                setTimeout(() => {
                    window.location.href = `chat.html?userId=${data.solicitante.id}&requestId=${requestId}`;
                }, 1000);
            }
        } else {
            const error = await response.text();
            showNotification(`Erro: ${error}`, 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showNotification('Erro ao aceitar solicitação.', 'error');
    }
}

// Função para recusar solicitação
async function rejectRequest(requestId, donationId) {
    if (!confirm('Tem certeza que deseja recusar esta solicitação?')) {
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        showNotification('Você precisa estar logado.', 'error');
        return;
    }

    try {
        const response = await fetch(`/doacoes/solicitacoes/${requestId}/recusar`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            showNotification('Solicitação recusada.', 'success');
            
            // Notificar sistema de tempo real
            if (typeof notifySolicitacaoRecusada === 'function') {
                notifySolicitacaoRecusada(data);
            } else if (typeof window.realtimeManager !== 'undefined') {
                window.realtimeManager.notifySolicitacaoRecusada(data);
            }
            
            // Fechar modal e recarregar
            document.querySelector('.requests-modal')?.remove();
            
            if (window.minhasDoacoesApp) {
                await window.minhasDoacoesApp.loadMyDonations();
            }
        } else {
            const error = await response.text();
            showNotification(`Erro: ${error}`, 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showNotification('Erro ao recusar solicitação.', 'error');
    }
}

// Função para marcar como coletada
async function markAsCollected(requestId, donationId) {
    if (!confirm('Confirmar que a coleta/entrega foi realizada?')) {
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        showNotification('Você precisa estar logado.', 'error');
        return;
    }

    try {
        const response = await fetch(`/doacoes/solicitacoes/${requestId}/marcar-coletada`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            showNotification('Solicitação marcada como coletada!', 'success');
            
            // Fechar modal e recarregar
            document.querySelector('.requests-modal')?.remove();
            
            if (window.minhasDoacoesApp) {
                await window.minhasDoacoesApp.loadMyDonations();
            }
            
            // Solicitar avaliação
            setTimeout(() => {
                showEvaluationModal(requestId);
            }, 1500);
        } else {
            const error = await response.text();
            showNotification(`Erro: ${error}`, 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showNotification('Erro ao marcar como coletada.', 'error');
    }
}

// Função para cancelar solicitação
async function cancelRequest(requestId, donationId) {
    if (!confirm('Tem certeza que deseja cancelar esta solicitação? Esta ação não pode ser desfeita.')) {
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        showNotification('Você precisa estar logado.', 'error');
        return;
    }

    try {
        const response = await fetch(`/doacoes/solicitacoes/${requestId}/cancelar`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok || response.status === 204) {
            showNotification('Solicitação cancelada com sucesso!', 'success');
            
            // Fechar modal e recarregar
            document.querySelector('.requests-modal')?.remove();
            
            // Notificar sistema de tempo real
            if (typeof window.realtimeManager !== 'undefined' && 
                window.realtimeManager && 
                typeof window.realtimeManager.notifySolicitacaoCancelada === 'function') {
                window.realtimeManager.notifySolicitacaoCancelada({ id: requestId });
            } else if (typeof notifySolicitacaoCancelada === 'function') {
                notifySolicitacaoCancelada({ id: requestId });
            }
            
            if (window.minhasDoacoesApp) {
                await window.minhasDoacoesApp.loadMyDonations();
            }
        } else {
            const error = await response.text();
            showNotification(`Erro: ${error}`, 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showNotification('Erro ao cancelar solicitação.', 'error');
    }
}

// Função para abrir chat
function openChat(userId, requestId) {
    // Redirecionar para chat com o usuário
    if (userId) {
        window.location.href = `chat.html?userId=${userId}&requestId=${requestId}`;
    } else {
        window.location.href = 'chat.html';
    }
}

// Função para mostrar modal de avaliação
function showEvaluationModal(requestId) {
    if (typeof window.showEvaluationModal === 'function') {
        window.showEvaluationModal(requestId);
    } else {
        console.log('Sistema de avaliação não carregado');
    }
}

// Adicionar estilos de animação
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    @keyframes slideUp {
        from {
            transform: translateY(20px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Inicializar a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.minhasDoacoesApp = new MinhasDoacoesApp();
});
