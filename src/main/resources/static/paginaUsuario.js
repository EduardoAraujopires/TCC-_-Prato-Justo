/**
 * Sistema de Perfil do Usuário - Prato Justo
 * Gerencia a exibição e edição do perfil do usuário
 */
class ProfileManager {
    constructor() {
        this.currentUser = null;
        this.viewingUserId = null; // ID do usuário que está sendo visualizado (pode ser diferente do usuário logado)
        this.isViewingOwnProfile = true; // Se está vendo o próprio perfil
        this.userStats = {
            totalDonations: 0,
            averageRating: 0,
            totalRatings: 0,
            daysActive: 0
        };
        this.userDonations = [];
        this.userRatings = [];
        this.init();
    }

    async init() {
        console.log('=== DEBUG init ===');
        console.log('ProfileManager inicializando...');
        
        // Verificar se o usuário está logado antes de carregar dados
        if (!this.isUserAuthenticated()) {
            console.log('Usuário não autenticado, redirecionando...');
            this.redirectToLogin();
            return;
        }

        // Verificar se há userId na URL (visualizando perfil de outro usuário)
        const urlParams = new URLSearchParams(window.location.search);
        const userIdParam = urlParams.get('userId');
        
        if (userIdParam) {
            this.viewingUserId = parseInt(userIdParam);
            console.log('Visualizando perfil do usuário ID:', this.viewingUserId);
            
            // Verificar se é o próprio perfil
            const currentUser = window.authManager ? window.authManager.getCurrentUser() : null;
            this.isViewingOwnProfile = currentUser && currentUser.id && parseInt(currentUser.id) === this.viewingUserId;
            console.log('É o próprio perfil?', this.isViewingOwnProfile);
        } else {
            // Se não há userId na URL, mostrar perfil do usuário logado
            this.isViewingOwnProfile = true;
            console.log('Mostrando perfil do usuário logado');
        }

        console.log('Usuário autenticado, carregando dados...');
        await this.loadUserData();
        this.setupEventListeners();
        await this.loadUserDonations();
        await this.loadUserRatings();
        await this.calculateUserStats();
        
        // Aplicar tema salvo
        const savedTheme = localStorage.getItem('pratoJustoTheme') || 'light';
        this.applyTheme(savedTheme);
    }

    /**
     * Verifica se o usuário está autenticado
     */
    isUserAuthenticated() {
        return window.authManager && window.authManager.isAuthenticated();
    }

    /**
     * Redireciona para a tela de cadastro se não estiver logado
     */
    redirectToLogin() {
        window.location.href = 'cadastro_perfil.html';
    }

    /**
     * Carrega os dados do usuário do sistema de autenticação
     */
    async loadUserData() {
        console.log('=== DEBUG loadUserData ===');
        console.log('authManager existe:', !!window.authManager);
        console.log('authManager autenticado:', window.authManager ? window.authManager.isAuthenticated() : false);
        console.log('viewingUserId:', this.viewingUserId);
        console.log('isViewingOwnProfile:', this.isViewingOwnProfile);
        
        try {
            // Buscar dados ATUALIZADOS da API (incluindo campos de endereço)
            if (window.authManager && window.authManager.isAuthenticated()) {
                const token = window.authManager.getToken();
                console.log('Buscando dados atualizados da API...');
                
                // Se há viewingUserId, buscar dados desse usuário específico
                // Caso contrário, buscar dados do usuário logado
                const apiUrl = this.viewingUserId 
                    ? `/api/user/${this.viewingUserId}` 
                    : '/api/user/me';
                
                console.log('URL da API:', apiUrl);
                
                const response = await fetch(apiUrl, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    this.currentUser = await response.json();
                    console.log('✅ Dados do usuário carregados da API:', this.currentUser);
                    
                    // Se for o próprio perfil, atualizar localStorage
                    if (this.isViewingOwnProfile) {
                        localStorage.setItem('user', JSON.stringify(this.currentUser));

                        // Notificar outras partes da UI (header) que o usuário foi atualizado
                        document.dispatchEvent(new CustomEvent('authStateChanged', {
                            detail: { isAuthenticated: true, user: this.currentUser }
                        }));
                    }

                    this.updateProfileDisplay();
                } else {
                    console.error('❌ Erro ao buscar dados da API:', response.status);
                    const errorText = await response.text();
                    console.error('Erro:', errorText);
                    // Fallback para dados do localStorage se a API falhar
                    if (this.isViewingOwnProfile) {
                        this.loadFromAuthManager();
                    } else {
                        this.showNotification('Erro ao carregar perfil do usuário', 'error');
                    }
                }
            } else {
                console.log('Não autenticado, usando dados padrão');
                this.setDefaultUser();
            }
        } catch (error) {
            console.error('❌ Erro ao carregar dados do usuário:', error);
            // Fallback para dados do localStorage se houver erro
            if (this.isViewingOwnProfile) {
                this.loadFromAuthManager();
            } else {
                this.showNotification('Erro ao carregar perfil do usuário', 'error');
            }
        }
    }

    /**
     * Carrega dados do authManager como fallback
     */
    loadFromAuthManager() {
        console.log('📦 Usando dados do localStorage como fallback...');
        if (window.authManager && window.authManager.getCurrentUser()) {
            this.currentUser = window.authManager.getCurrentUser();
            console.log('Dados carregados do authManager (fallback):', this.currentUser);
            this.updateProfileDisplay();
        } else {
            this.setDefaultUser();
        }
    }

    /**
     * Carrega dados de fallback do localStorage
     */
    loadFallbackData() {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
                this.currentUser = JSON.parse(storedUser);
                this.updateProfileDisplay();
        } catch (error) {
          console.error('Erro ao parsear dados do usuário:', error);
                this.setDefaultUser();
            }
        } else {
            this.setDefaultUser();
        }
    }

    /**
     * Define dados padrão do usuário
     */
    setDefaultUser() {
        this.currentUser = {
            id: null,
            nome: 'Usuário',
            email: 'usuario@email.com',
            telefone: null,
            tipoUsuario: 'INDIVIDUAL',
            dataCadastro: new Date().toISOString(),
            statusAtivo: true,
            verificado: false
        };
        this.updateProfileDisplay();
    }

    /**
     * Atualiza a exibição do perfil na interface
     */
    updateProfileDisplay() {
        console.log('=== DEBUG updateProfileDisplay ===');
        console.log('currentUser:', this.currentUser);
        console.log('isViewingOwnProfile:', this.isViewingOwnProfile);
        
        if (!this.currentUser) {
            console.log('currentUser é null, retornando');
            return;
        }

        // Esconder botão "Editar Perfil" se estiver vendo perfil de outro usuário
        const editProfileBtn = document.getElementById('edit-profile-btn');
        if (editProfileBtn) {
            if (this.isViewingOwnProfile) {
                editProfileBtn.style.display = 'flex';
            } else {
                editProfileBtn.style.display = 'none';
            }
        }

        // Esconder botões de editar cards se estiver vendo perfil de outro usuário
        // Esconder botão de editar preferências (preferências não são editáveis pelo modal)
        document.querySelectorAll('.btn-edit-card').forEach(btn => {
            const cardType = btn.dataset.card;
            if (cardType === 'preferences') {
                btn.style.display = 'none'; // Sempre esconder botão de editar preferências
            } else if (this.isViewingOwnProfile) {
                btn.style.display = 'flex';
            } else {
                btn.style.display = 'none';
            }
        });

        // Informações básicas
        const userNameElement = document.getElementById('profile-user-name');
        console.log('Elemento profile-user-name encontrado:', !!userNameElement);
        console.log('Nome a ser definido:', this.currentUser.nome || 'Usuário');
        
        if (userNameElement) {
            userNameElement.textContent = this.currentUser.nome || 'Usuário';
            console.log('Nome definido com sucesso!');
        } else {
            console.error('Elemento profile-user-name NÃO encontrado!');
            // Tentar novamente após um delay
            setTimeout(() => {
                const retryElement = document.getElementById('profile-user-name');
                if (retryElement) {
                    retryElement.textContent = this.currentUser.nome || 'Usuário';
                    console.log('Nome definido na segunda tentativa!');
                }
            }, 100);
        }
        document.getElementById('user-type-text').textContent = this.getUserTypeLabel(this.currentUser.tipoUsuario);
        
            // Avatar
            const avatarImg = document.getElementById('user-avatar');
            const avatarPlaceholder = document.getElementById('user-avatar-placeholder');
            const avatarContainer = avatarImg ? avatarImg.closest('.avatar-container') : null;
            
            if (this.currentUser.avatarUrl) {
                // Configurar handler de erro se ainda não foi configurado
                if (avatarImg && !avatarImg.hasAttribute('data-error-handler')) {
                    avatarImg.setAttribute('data-error-handler', 'true');
                    avatarImg.addEventListener('error', () => {
                        console.warn('Avatar não encontrado:', this.currentUser.avatarUrl);
                        if (avatarImg) avatarImg.style.display = 'none';
                        if (avatarPlaceholder) {
                            avatarPlaceholder.style.display = 'flex';
                            const userInitial = this.currentUser.nome ? this.currentUser.nome.charAt(0).toUpperCase() : 'U';
                            avatarPlaceholder.textContent = userInitial;
                        }
                        if (avatarContainer) avatarContainer.classList.remove('has-avatar');
                    });
                }
                
                // Construir URL completa do avatar
                let avatarUrl = this.currentUser.avatarUrl;
                // Se a URL não começa com http, adicionar o base URL da API
                if (!avatarUrl.startsWith('http')) {
                    // Obter base URL da API
                    const apiBaseUrl = window.API_BASE_URL || (() => {
                        const protocol = window.location.protocol;
                        const hostname = window.location.hostname;
                        const port = (hostname === 'localhost' || hostname === '127.0.0.1') ? ':8080' : (window.location.port ? ':' + window.location.port : '');
                        return `${protocol}//${hostname}${port}`;
                    })();
                    avatarUrl = apiBaseUrl + (avatarUrl.startsWith('/') ? '' : '/') + avatarUrl;
                }
                
                // Adicionar cache-busting para garantir que a imagem atualize
                const updatedAt = localStorage.getItem('avatarUpdatedAt');
                const urlWithVersion = avatarUrl + (avatarUrl.includes('?') ? '&' : '?') + 'v=' + (updatedAt || Date.now());
                avatarImg.src = urlWithVersion;
                avatarImg.style.display = 'block';
                avatarPlaceholder.style.display = 'none';
                if (avatarContainer) avatarContainer.classList.add('has-avatar');
            } else {
                avatarImg.style.display = 'none';
                avatarPlaceholder.style.display = 'flex';
                // Criar iniciais do nome
                const userInitial = this.currentUser.nome ? this.currentUser.nome.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U';
                avatarPlaceholder.textContent = userInitial;
                if (avatarContainer) avatarContainer.classList.remove('has-avatar');
            }

        // Badge de verificação
        const verificationBadge = document.getElementById('verification-badge');
        if (this.currentUser.verificado) {
            verificationBadge.style.display = 'flex';
        }

        // Contatos
        document.getElementById('contact-email').textContent = this.currentUser.email || 'Não informado';
        document.getElementById('contact-phone').textContent = this.currentUser.telefone || 'Não informado';
        
        // Data de cadastro
        const joinDate = this.currentUser.dataCadastro ? 
            new Date(this.currentUser.dataCadastro).toLocaleDateString('pt-BR') : 'Não informado';
        document.getElementById('member-since').textContent = joinDate;

        // Endereço
        const enderecoCompleto = this.currentUser.rua ? 
            `${this.currentUser.rua}${this.currentUser.numero ? ', ' + this.currentUser.numero : ''}${this.currentUser.complemento ? ' - ' + this.currentUser.complemento : ''}` : 
            'Não informado';
        document.getElementById('address-text').textContent = enderecoCompleto;
        document.getElementById('city-text').textContent = this.currentUser.cidade || 'Não informado';
        
        const localizacao = (this.currentUser.cidade && this.currentUser.estado) ? 
            `${this.currentUser.cidade} - ${this.currentUser.estado}` : 
            (this.currentUser.cidade || this.currentUser.estado || 'Não informado');
        document.getElementById('location-text').textContent = localizacao;

        // Descrição
        document.getElementById('description-text').textContent = this.currentUser.descricao || 'Não informado';

        // Preferências
        const notifications = localStorage.getItem('userNotifications') || 'ativadas';
        
        // Sempre usar português como idioma padrão
        const language = 'pt-BR';
        localStorage.setItem('userLanguage', 'pt-BR');
        
        const theme = localStorage.getItem('pratoJustoTheme') || 'light';
        
        // Mapear valores para exibição
        const notificationsLabel = notifications === 'ativadas' || notifications === 'true' ? 'Ativadas' : 'Desativadas';
        const languageLabel = 'Português'; // Sempre português
        const themeLabels = {
            'dark': 'Escuro',
            'light': 'Claro',
            'escuro': 'Escuro',
            'claro': 'Claro',
            'auto': 'Automático'
        };
        const themeLabel = themeLabels[theme] || 'Claro';
        
        const notificationsEl = document.getElementById('notifications-pref');
        const languageEl = document.getElementById('language-pref');
        const themeEl = document.getElementById('theme-pref');
        
        if (notificationsEl) notificationsEl.textContent = notificationsLabel;
        if (languageEl) languageEl.textContent = languageLabel;
        if (themeEl) themeEl.textContent = themeLabel;

        // Calcular dias ativo
        if (this.currentUser.dataCadastro) {
            const joinDate = new Date(this.currentUser.dataCadastro);
            const today = new Date();
            const diffTime = Math.abs(today - joinDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            document.getElementById('days-active').textContent = diffDays;
    }
  }

  /**
     * Converte tipo de usuário para label amigável
     */
    getUserTypeLabel(tipoUsuario) {
        const labels = {
            'INDIVIDUAL': 'Pessoa Física',
            'ESTABELECIMENTO': 'Estabelecimento',
            'ONG': 'ONG',
            'RECEPTOR': 'Receptor'
        };
        return labels[tipoUsuario] || 'Usuário';
    }

    /**
     * Carrega as doações do usuário
     */
    async loadUserDonations() {
        try {
            if (window.authManager && window.authManager.isAuthenticated()) {
                const token = window.authManager.getToken();
                
                // Se está visualizando perfil de outro usuário, usar endpoint específico
                // Caso contrário, usar endpoint de doações próprias
                let apiUrl = '/doacoes/minhas';
                
                // Se há viewingUserId e não é o próprio perfil, buscar doações desse usuário
                if (this.viewingUserId && !this.isViewingOwnProfile) {
                    apiUrl = `/doacoes/usuario/${this.viewingUserId}`;
                    console.log('Buscando doações do usuário:', this.viewingUserId, 'via:', apiUrl);
                }
                
                const response = await fetch(apiUrl, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    this.userDonations = await response.json();
                    console.log('Doações carregadas:', this.userDonations.length);
                    
                    console.log('Doações carregadas:', this.userDonations.length);
                    
                    // Buscar solicitações de cada doação para determinar status correto
                    await this.loadDonationRequests(token);
                    
                    this.displayUserDonations();
                } else {
                    console.error('Erro ao carregar doações:', response.statusText);
                    this.displayEmptyDonations();
                }
            } else {
                this.displayEmptyDonations();
            }
        } catch (error) {
            console.error('Erro ao carregar doações:', error);
            this.displayEmptyDonations();
        }
    }

    /**
     * Carrega as solicitações de cada doação para determinar o status
     */
    async loadDonationRequests(token) {
        try {
            // Buscar solicitações para cada doação (limitado às 5 mais recentes para performance)
            const donationsToCheck = this.userDonations.slice(0, 5);
            
            for (const donation of donationsToCheck) {
                try {
                    const response = await fetch(`/doacoes/${donation.id}/solicitacoes`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    if (response.ok) {
                        const requests = await response.json();
                        // Armazenar as solicitações na doação para uso no getDonationStatus
                        donation.solicitacoes = requests;
                    } else {
                        donation.solicitacoes = [];
                    }
                } catch (error) {
                    console.error(`Erro ao buscar solicitações da doação ${donation.id}:`, error);
                    donation.solicitacoes = [];
                }
            }
        } catch (error) {
            console.error('Erro ao carregar solicitações das doações:', error);
        }
    }

  /**
     * Exibe as doações do usuário na interface
     */
    displayUserDonations() {
        const donationsList = document.getElementById('donations-list');
        
        if (this.userDonations.length === 0) {
            donationsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <span>Nenhuma doação encontrada</span>
                </div>
            `;
            return;
        }

        const donationsHTML = this.userDonations.slice(0, 5).map(donation => `
            <div class="donation-item">
                <div class="donation-info">
                    <div class="donation-title">${donation.titulo || 'Doação'}</div>
                    <div class="donation-description">${donation.descricao || 'Sem descrição'}</div>
                    <div class="donation-date">${new Date(donation.criadoEm).toLocaleDateString('pt-BR')}</div>
                </div>
                <div class="donation-status status-${this.getDonationStatus(donation)}">
                    ${this.getDonationStatusLabel(donation)}
                </div>
            </div>
        `).join('');

        donationsList.innerHTML = donationsHTML;
    }

    /**
     * Exibe estado vazio para doações
     */
    displayEmptyDonations() {
        const donationsList = document.getElementById('donations-list');
        donationsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <span>Nenhuma doação encontrada</span>
            </div>
        `;
    }

    /**
     * Determina o status da doação baseado nas solicitações
     */
    getDonationStatus(donation) {
        const requests = donation.solicitacoes || [];
        
        // Verificar se tem solicitações concluídas
        const completedRequests = requests.filter(r => r.status === 'concluida');
        const inProgressRequests = requests.filter(r => r.status === 'em_andamento');
        const pendingRequests = requests.filter(r => r.status === 'solicitada');
        
        // Se não está ativa E tem solicitações concluídas = Concluída (não cancelada!)
        if (!donation.ativo && completedRequests.length > 0) {
            return 'delivered';
        }
        
        // Se tem solicitações em andamento
        if (inProgressRequests.length > 0) {
            return 'in_progress';
        }
        
        // Se tem solicitações pendentes (aguardando)
        if (pendingRequests.length > 0) {
            return 'pending';
        }
        
        // Se não está ativa e não tem solicitações concluídas = Cancelada/Inativa
        if (!donation.ativo) {
            return 'cancelled';
        }
        
        // Doação ativa sem solicitações = Disponível
        return 'available';
    }

    /**
     * Retorna label do status da doação
     */
    getDonationStatusLabel(donation) {
        const status = this.getDonationStatus(donation);
        const labels = {
            'delivered': '✓ Concluída',
            'in_progress': 'Em Andamento',
            'pending': 'Aguardando',
            'available': 'Disponível',
            'cancelled': 'Inativa'
        };
        return labels[status] || 'Disponível';
    }

    /**
     * Carrega as avaliações do usuário
     */
    async loadUserRatings() {
        try {
            if (window.authManager && window.authManager.isAuthenticated() && this.currentUser) {
                const token = window.authManager.getToken();
                
                // Usar o ID do usuário que está sendo visualizado
                const userId = this.currentUser.id;
                
                // Buscar avaliações recebidas (avaliações de solicitações)
                const avaliacoesResponse = await fetch(`/avaliacoes-solicitacao/usuario/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (avaliacoesResponse.ok) {
                    this.userRatings = await avaliacoesResponse.json();
                } else {
                    this.userRatings = [];
                }

                // Buscar média de avaliações
                const mediaResponse = await fetch(`/avaliacoes-solicitacao/usuario/${userId}/media`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (mediaResponse.ok) {
                    const mediaData = await mediaResponse.json();
                    this.userStats.averageRating = mediaData.media || 0.0;
                    this.userStats.totalRatings = mediaData.total || 0;
                }
            } else {
                this.userRatings = [];
            }
        } catch (error) {
            console.error('Erro ao carregar avaliações:', error);
            this.userRatings = [];
        }

        this.displayUserRatings();
        this.updateStatsDisplay();
    }

    /**
     * Exibe as avaliações do usuário na interface
     */
    displayUserRatings() {
        const ratingsList = document.getElementById('ratings-list');
        if (!ratingsList) return;
        
        if (!this.userRatings || this.userRatings.length === 0) {
            ratingsList.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 2rem; color: #64748b;">
                    <i class="fas fa-star" style="font-size: 2rem; color: #d1d5db; margin-bottom: 0.5rem; display: block;"></i>
                    <span>Nenhuma avaliação encontrada</span>
                </div>
            `;
            return;
        }

        // Mostrar as últimas 5 avaliações
        const recentRatings = this.userRatings.slice(0, 5);
        
        ratingsList.innerHTML = recentRatings.map(avaliacao => {
            const starsHTML = Array(5).fill(0).map((_, i) => 
                i < avaliacao.nota 
                    ? '<i class="fas fa-star" style="color: #fbbf24;"></i>'
                    : '<i class="far fa-star" style="color: #d1d5db;"></i>'
            ).join('');

            const avaliadorNome = avaliacao.avaliador?.nome || avaliacao.avaliadorNome || 'Usuário';
            const avaliadorId = avaliacao.avaliador?.id;
            const avatarUrl = avaliacao.avaliador?.avatarUrl || avaliacao.avaliador?.fotoUsuario || avaliacao.avaliador?.fotoPerfil || null;
            const avatarInitials = (avaliadorNome || 'U').substring(0, 2).toUpperCase();
            const dataFormatada = avaliacao.criadoEm 
                ? new Date(avaliacao.criadoEm).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                })
                : 'Data não informada';

            return `
                <div class="rating-item" style="
                    padding: 1rem 1.1rem;
                    margin-bottom: 0.6rem;
                    border-radius: 12px;
                    background: linear-gradient(145deg, rgba(255,255,255,0.03), rgba(255,255,255,0.06));
                    border: 1px solid rgba(255,255,255,0.07);
                    box-shadow: 0 12px 30px rgba(0,0,0,0.18);
                    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
                    overflow: hidden;
                    min-width: 0;
                " 
                     onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 14px 34px rgba(0,0,0,0.22)'; this.style.borderColor='rgba(255,255,255,0.12)'" 
                     onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 12px 30px rgba(0,0,0,0.18)'; this.style.borderColor='rgba(255,255,255,0.07)'">
                    <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.85rem; width: 100%; min-width: 0;">
                        <div style="display: flex; align-items: center; gap: 0.75rem; min-width: 0; flex: 1;">
                            <div style="
                                width: 44px;
                                height: 44px;
                                border-radius: 50%;
                                background: linear-gradient(135deg, #667eea, #764ba2);
                                color: white;
                                font-weight: 700;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                overflow: hidden;
                                cursor: default;
                                flex-shrink: 0;
                                box-shadow: 0 3px 10px rgba(0,0,0,0.16);
                            ">
                                ${avatarUrl 
                                    ? `<img src="${avatarUrl}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;">`
                                    : `<span style="font-size: 0.95rem;">${avatarInitials}</span>`}
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 0.12rem; min-width: 0; flex: 1;">
                                <span style="font-weight: 700; color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                    ${avaliadorNome}
                                </span>
                                <span style="font-size: 0.8rem; color: #cbd5e1; display: flex; align-items: center; gap: 0.35rem;">
                                    <i class="fas fa-calendar" style="font-size: 0.75rem;"></i>
                                    ${dataFormatada}
                                </span>
                            </div>
                        </div>
                        <div style="font-size: 1rem; display: flex; align-items: center; gap: 0.2rem; flex-shrink: 0; color: #fbbf24; white-space: nowrap;">
                            ${starsHTML}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Sempre mostrar botão "Ver Todas" se houver avaliações (mesmo que sejam 5 ou menos)
        if (this.userRatings.length > 0) {
            const totalText = this.userRatings.length > 5 
                ? `Ver todas as ${this.userRatings.length} avaliações`
                : 'Ver todas as avaliações';
            
            ratingsList.innerHTML += `
                <div style="text-align: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e5e7eb;">
                    <button onclick="viewAllRatings()" style="
                        background: #667eea;
                        color: white;
                        border: none;
                        padding: 0.75rem 1.5rem;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                        font-size: 0.9rem;
                        transition: all 0.2s;
                    " onmouseover="this.style.background='#5568d3'; this.style.transform='translateY(-2px)'" 
                       onmouseout="this.style.background='#667eea'; this.style.transform='translateY(0)'">
                        <i class="fas fa-external-link-alt" style="margin-right: 0.5rem;"></i>
                        ${totalText}
                    </button>
                </div>
            `;
        }
    }

    /**
     * Calcula estatísticas do usuário
     */
    async calculateUserStats() {
        // Usar dados reais da API
        try {
            if (window.authManager && window.authManager.isAuthenticated() && this.currentUser) {
                const token = window.authManager.getToken();
                
                // Se for o próprio perfil, usar endpoint de stats
                // Caso contrário, calcular baseado nas doações e avaliações carregadas
                if (this.isViewingOwnProfile) {
                    const statsResponse = await fetch('/api/user/me/stats', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (statsResponse.ok) {
                        const stats = await statsResponse.json();
                        this.userStats.totalDonations = stats.totalDonations || 0;
                    } else {
                        // Fallback para dados locais
                        this.userStats.totalDonations = this.userDonations.length;
                    }
                } else {
                    // Para perfil de outro usuário, usar contagem de doações carregadas
                    this.userStats.totalDonations = this.userDonations.length;
                }

                // Buscar média de avaliações de solicitações (já carregada em loadUserRatings)
                // As estatísticas de avaliação já foram atualizadas em loadUserRatings
            } else {
                this.userStats.totalDonations = this.userDonations.length;
                this.userStats.averageRating = 0.0;
                this.userStats.totalRatings = 0;
            }
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
            this.userStats.totalDonations = this.userDonations.length;
            this.userStats.averageRating = 0.0;
            this.userStats.totalRatings = 0;
        }

        this.updateStatsDisplay();
    }

    /**
     * Atualiza a exibição das estatísticas
     */
    updateStatsDisplay() {
        document.getElementById('total-donations').textContent = this.userStats.totalDonations;
        document.getElementById('average-rating').textContent = this.userStats.averageRating.toFixed(1);

        // Estatísticas nos cards
        document.getElementById('total-donations-stat').textContent = this.userStats.totalDonations;
        document.getElementById('average-rating-stat').textContent = this.userStats.averageRating.toFixed(1);

        // Avaliações
        const ratingAverageEl = document.getElementById('rating-average');
        const ratingCountEl = document.getElementById('rating-count');
        if (ratingAverageEl) {
            ratingAverageEl.textContent = this.userStats.averageRating.toFixed(1);
        }
        if (ratingCountEl) {
            ratingCountEl.textContent = this.userStats.totalRatings || this.userRatings.length;
        }

        // Atualizar estrelas
        this.updateStarsDisplay(this.userStats.averageRating);
    }

    /**
     * Atualiza a exibição das estrelas
     */
    updateStarsDisplay(rating) {
        const starsDisplay = document.getElementById('stars-display');
        const stars = starsDisplay.querySelectorAll('i');
        
        stars.forEach((star, index) => {
            if (index < Math.floor(rating)) {
                star.classList.add('fas');
                star.classList.remove('far');
            } else if (index < rating) {
                star.classList.add('fas', 'fa-star-half-alt');
                star.classList.remove('far');
            } else {
                star.classList.add('far');
                star.classList.remove('fas', 'fa-star-half-alt');
      }
    });
  }

  /**
     * Configura os event listeners
     */
    setupEventListeners() {
        // Botão de editar perfil
        const editProfileBtn = document.getElementById('edit-profile-btn');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => this.openEditModal());
        }

        // Botões de editar cards
        document.querySelectorAll('.btn-edit-card').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                // Garantir que pegamos o botão mesmo se o clique foi no ícone
                const button = e.target.closest('.btn-edit-card') || e.currentTarget;
                const cardType = button.dataset.card;
                if (cardType) {
                    this.editCard(cardType);
                }
            });
        });

        // Botões de ver todas
        document.querySelectorAll('.btn-view-all').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.closest('.btn-view-all').dataset.section;
                this.viewAll(section);
      });
    });

        // Modal de edição
        this.setupModalEvents();
    }

    /**
     * Configura eventos do modal
     */
    setupModalEvents() {
        const modal = document.getElementById('edit-profile-modal');
        const overlay = document.getElementById('modal-overlay');
        const closeBtn = document.querySelector('.btn-close-modal');
        const cancelBtn = document.querySelector('.btn-cancel');
        const form = document.getElementById('edit-profile-form');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeEditModal());
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeEditModal());
        }

        if (form) {
            form.addEventListener('submit', (e) => this.saveProfile(e));
        }

        // Fechar modal ao clicar no overlay
        if (overlay) {
            overlay.addEventListener('click', () => {
                    this.closeEditModal();
            });
        }

        // Upload de avatar
        this.setupAvatarUpload();
    }

    /**
     * Configura o sistema de upload de avatar
     */
    setupAvatarUpload() {
        const uploadBtn = document.querySelector('.btn-upload-avatar');
        const avatarInput = document.getElementById('avatar-upload');
        const avatarPreviewContainer = document.querySelector('.avatar-preview-container');

        if (uploadBtn && avatarInput) {
            // Ao clicar no botão, abrir o seletor de arquivos
            uploadBtn.addEventListener('click', () => {
                avatarInput.click();
            });

            // Ao clicar no container do avatar, abrir o seletor de arquivos
            if (avatarPreviewContainer) {
                avatarPreviewContainer.addEventListener('click', () => {
                    avatarInput.click();
                });
            }

            // Quando um arquivo é selecionado
            avatarInput.addEventListener('change', (e) => {
                this.handleAvatarUpload(e);
            });
        }
    }

    /**
     * Manipula o upload do avatar
     */
    handleAvatarUpload(event) {
        const file = event.target.files[0];
        
        if (!file) return;

        // Validar tipo de arquivo
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            this.showNotification('Por favor, selecione uma imagem válida (JPG, PNG ou GIF)', 'error');
            return;
        }

        // Validar tamanho (5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB em bytes
        if (file.size > maxSize) {
            this.showNotification('A imagem deve ter no máximo 5MB', 'error');
            return;
        }

        // Preview da imagem
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('edit-avatar-preview');
            const placeholder = document.getElementById('edit-avatar-placeholder');
            
            if (preview && placeholder) {
                preview.src = e.target.result;
                preview.style.display = 'block';
                placeholder.style.display = 'none';

                const container = preview.closest('.avatar-preview-container');
                if (container) container.classList.add('has-avatar');
            }

            // Armazenar o arquivo para envio posterior
            this.pendingAvatarFile = file;
            this.pendingAvatarData = e.target.result;
        };

        reader.readAsDataURL(file);
    }

    /**
     * Abre o modal de edição
     */
    openEditModal() {
        const modal = document.getElementById('edit-profile-modal');
        if (modal) {
            this.populateEditForm();
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Fecha o modal de edição
     */
    closeEditModal() {
        const modal = document.getElementById('edit-profile-modal');
        if (modal) {
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    }

    /**
     * Preenche o formulário de edição com dados atuais
     */
    populateEditForm() {
        if (!this.currentUser) return;

        document.getElementById('edit-name').value = this.currentUser.nome || '';
        document.getElementById('edit-email').value = this.currentUser.email || '';
        document.getElementById('edit-phone').value = this.currentUser.telefone || '';
        document.getElementById('edit-description').value = this.currentUser.descricao || '';
        
        // Preencher endereço completo (rua)
        document.getElementById('edit-address').value = this.currentUser.rua || '';
        document.getElementById('edit-city').value = this.currentUser.cidade || '';


        // Avatar
        const preview = document.getElementById('edit-avatar-preview');
        const placeholder = document.getElementById('edit-avatar-placeholder');
        
        if (this.currentUser.avatarUrl && preview && placeholder) {
            preview.src = this.currentUser.avatarUrl;
            preview.style.display = 'block';
            placeholder.style.display = 'none';
        } else if (preview && placeholder) {
            preview.style.display = 'none';
            placeholder.style.display = 'flex';
        }

        // Limpar arquivo pendente
        this.pendingAvatarFile = null;
        this.pendingAvatarData = null;
    }

    /**
     * Salva as alterações do perfil
     */
    async saveProfile(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        
        // Validar campos obrigatórios
        const nome = formData.get('name');
        const email = formData.get('email');
        
        if (!nome || nome.trim() === '') {
            this.showNotification('O nome é obrigatório', 'error');
            return;
        }
        
        if (!email || email.trim() === '') {
            this.showNotification('O email é obrigatório', 'error');
            return;
        }
        
        const updatedData = {
            nome: nome.trim(),
            email: email.trim(),
            telefone: formData.get('phone') || null,
            descricao: formData.get('description') || null,
            rua: formData.get('address') || null,
            cidade: formData.get('city') || null
        };


        console.log('📤 Enviando dados:', updatedData);

        try {
            if (window.authManager && window.authManager.isAuthenticated()) {
                const token = window.authManager.getToken();
                
                // Se houver arquivo de avatar, fazer upload PRIMEIRO
                if (this.pendingAvatarFile) {
                    console.log('📸 Fazendo upload do avatar...');
                    await this.uploadAvatar(this.pendingAvatarFile, token);
                    // Marcar timestamp para cache-busting no header
                    localStorage.setItem('avatarUpdatedAt', Date.now().toString());
                }
                
                // Depois, atualizar dados do perfil
                const response = await fetch('/api/user/me', {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedData)
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('✅ Perfil atualizado:', data);

                    // Atualizar dados locais
                    Object.assign(this.currentUser, data);
                    
                    // Atualizar localStorage com os dados mais recentes
                    localStorage.setItem('user', JSON.stringify(this.currentUser));
                    
                    // NÃO salvar userAvatar globalmente - o avatar sempre vem do objeto user (identificado via JWT)
                    
                    this.closeEditModal();
                    this.showNotification('Perfil atualizado com sucesso!', 'success');
                    
                    // Recarregar a página para refletir todas as mudanças
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    // Tentar obter mensagem de erro do servidor
                    const errorText = await response.text();
                    console.error('❌ Erro do servidor:', errorText);
                    throw new Error(errorText || 'Erro ao atualizar perfil');
                }
            } else {
                // Fallback: salvar no localStorage
                // NOTA: base64 é apenas para preview local, não salvamos no servidor
                if (this.pendingAvatarData) {
                    updatedData.avatarUrl = this.pendingAvatarData;
                }
                Object.assign(this.currentUser, updatedData);
                localStorage.setItem('user', JSON.stringify(this.currentUser));
                
                // NÃO salvar userAvatar globalmente - o avatar sempre vem do objeto user (identificado via JWT)
                
                this.updateProfileDisplay();
                this.closeEditModal();
                this.showNotification('Perfil atualizado com sucesso!', 'success');
            }
        } catch (error) {
            console.error('❌ Erro ao salvar perfil:', error);
            this.showNotification('Erro ao atualizar perfil: ' + error.message, 'error');
        }
    }

    /**
     * Faz upload do avatar do usuário
     */
    async uploadAvatar(file, token) {
        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const response = await fetch('/api/user/me/avatar', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                // Atualizar avatar local imediatamente com a URL retornada
                const data = await response.json();
                if (data && data.avatarUrl) {
                    this.currentUser = this.currentUser || {};
                    this.currentUser.avatarUrl = data.avatarUrl;
                    
                    // Persistir no localStorage
                    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                    const mergedUser = { ...storedUser, ...this.currentUser, avatarUrl: data.avatarUrl };
                    localStorage.setItem('user', JSON.stringify(mergedUser));
                    
                    // NÃO salvar userAvatar globalmente - cada usuário deve ter seu próprio avatar no objeto user
                    // O avatar sempre vem do objeto user que é identificado via JWT

                    // Avisar o header para atualizar a imagem (com cache-busting)
                    localStorage.setItem('avatarUpdatedAt', Date.now().toString());
                    document.dispatchEvent(new CustomEvent('authStateChanged', {
                        detail: { isAuthenticated: true, user: mergedUser }
                    }));

                    // Atualizar avatar na página de perfil, se visível
                    const avatarImg = document.getElementById('user-avatar');
                    const avatarPlaceholder = document.getElementById('user-avatar-placeholder');
                    if (avatarImg && avatarPlaceholder) {
                        const updatedAt = localStorage.getItem('avatarUpdatedAt');
                        const urlWithVersion = data.avatarUrl + (data.avatarUrl.includes('?') ? '&' : '?') + 'v=' + (updatedAt || Date.now());
                        avatarImg.src = urlWithVersion;
                        avatarImg.style.display = 'block';
                        avatarPlaceholder.style.display = 'none';
                        const avatarContainer = avatarImg.closest('.avatar-container');
                        if (avatarContainer) avatarContainer.classList.add('has-avatar');
                    }
                }
            } else {
                console.warn('Falha ao fazer upload do avatar, mas o perfil foi atualizado');
            }
        } catch (error) {
            console.error('Erro ao fazer upload do avatar:', error);
            // Não lançar erro para não afetar o resto da atualização
        }
    }

    /**
     * Aplica o tema selecionado
     */
    applyTheme(theme) {
        if (theme === 'dark' || theme === 'escuro') {
            document.body.classList.add('dark-theme');
        } else if (theme === 'light' || theme === 'claro') {
            document.body.classList.remove('dark-theme');
        } else if (theme === 'auto') {
            // Usar preferência do sistema
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                document.body.classList.add('dark-theme');
            } else {
                document.body.classList.remove('dark-theme');
            }
        }
    }

    /**
     * Edita um card específico
     */
    editCard(cardType) {
        // Se for preferências, não fazer nada (preferências não são editáveis pelo modal)
        if (cardType === 'preferences') {
            return;
        }
        
        // Abrir o modal de edição
        this.openEditModal();
        
        // Aguardar um pouco para garantir que o modal está aberto e visível
        setTimeout(() => {
            const modal = document.getElementById('edit-profile-modal');
            if (!modal || modal.getAttribute('aria-hidden') === 'true') {
                console.warn('Modal não está aberto');
                return;
            }
            
            let targetElement = null;
            
            switch(cardType) {
                case 'contact':
                    // Focar no campo de email (primeiro campo de contato)
                    targetElement = document.getElementById('edit-email');
                    break;
                case 'address':
                    // Focar no campo de endereço
                    targetElement = document.getElementById('edit-address');
                    break;
                default:
                    targetElement = document.getElementById('edit-name');
            }
            
            // Rolar até o elemento e focar nele
            if (targetElement) {
                // Scroll dentro do modal
                const modalBody = modal.querySelector('.modal-body');
                if (modalBody) {
                    const elementTop = targetElement.offsetTop;
                    modalBody.scrollTop = elementTop - 50; // 50px de margem superior
                } else {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                
                setTimeout(() => {
                    targetElement.focus();
                }, 300);
            }
        }, 150);
    }

    /**
     * Visualiza todas as seções
     */
    viewAll(section) {
        if (section === 'donations') {
            window.location.href = 'minhas-doacoes.html';
        } else if (section === 'ratings') {
            this.showAllRatings();
        }
    }

    /**
     * Mostra todas as avaliações em um modal
     */
    showAllRatings() {
        if (!this.userRatings || this.userRatings.length === 0) {
            this.showNotification('Nenhuma avaliação encontrada', 'info');
            return;
        }

        // Criar overlay do modal
        const overlay = document.createElement('div');
        overlay.className = 'ratings-modal-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 2rem;
            overflow-y: auto;
            animation: fadeIn 0.3s ease;
        `;

        // Criar conteúdo do modal
        const modalContent = document.createElement('div');
        modalContent.className = 'ratings-modal-content';
        modalContent.style.cssText = `
            background: white;
            border-radius: 20px;
            padding: 2rem;
            max-width: 800px;
            width: 100%;
            max-height: 85vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            animation: slideUp 0.3s ease;
        `;

        // Criar header do modal
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid #e5e7eb;
        `;

        const title = document.createElement('h2');
        title.style.cssText = `
            margin: 0;
            color: #667eea;
            font-size: 1.75rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        `;
        title.innerHTML = `
            <i class="fas fa-star" style="color: #fbbf24;"></i>
            Todas as Avaliações (${this.userRatings.length})
        `;

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        closeBtn.style.cssText = `
            background: none;
            border: none;
            font-size: 1.5rem;
            color: #64748b;
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        `;
        closeBtn.onmouseover = () => {
            closeBtn.style.background = '#f3f4f6';
            closeBtn.style.color = '#1e293b';
        };
        closeBtn.onmouseout = () => {
            closeBtn.style.background = 'none';
            closeBtn.style.color = '#64748b';
        };
        closeBtn.onclick = () => overlay.remove();

        header.appendChild(title);
        header.appendChild(closeBtn);

        // Criar lista de avaliações
        const ratingsContainer = document.createElement('div');
        ratingsContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 1rem;
        `;

        if (this.userRatings.length === 0) {
            ratingsContainer.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #64748b;">
                    <i class="fas fa-star" style="font-size: 3rem; color: #d1d5db; margin-bottom: 1rem;"></i>
                    <p style="font-size: 1.1rem; margin: 0;">Nenhuma avaliação encontrada</p>
                </div>
            `;
        } else {
            const ratingsHTML = this.userRatings.map(avaliacao => {
                const starsHTML = Array(5).fill(0).map((_, i) => 
                    i < avaliacao.nota 
                        ? '<i class="fas fa-star" style="color: #fbbf24;"></i>'
                        : '<i class="far fa-star" style="color: #d1d5db;"></i>'
                ).join('');

                const avaliadorNome = avaliacao.avaliador?.nome || 'Usuário';
                const avaliadorId = avaliacao.avaliador?.id;
                const avatarUrl = avaliacao.avaliador?.avatarUrl || avaliacao.avaliador?.fotoUsuario || avaliacao.avaliador?.fotoPerfil || null;
                const avatarInitials = (avaliadorNome || 'U').substring(0, 2).toUpperCase();
                const dataFormatada = avaliacao.criadoEm 
                    ? new Date(avaliacao.criadoEm).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    })
                    : 'Data não informada';

                return `
                    <div style="
                        background: #f9fafb;
                        padding: 1.5rem;
                        border-radius: 12px;
                        border-left: 4px solid #667eea;
                        transition: transform 0.2s, box-shadow 0.2s;
                    " onmouseover="this.style.transform='translateX(4px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'" 
                       onmouseout="this.style.transform='translateX(0)'; this.style.boxShadow='none'">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem; flex-wrap: wrap;">
                            <div style="display: flex; align-items: center; gap: 0.75rem; min-width: 0;">
                                <div style="
                                    width: 48px;
                                    height: 48px;
                                    border-radius: 50%;
                                    background: linear-gradient(135deg, #667eea, #764ba2);
                                    color: white;
                                    font-weight: 700;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    overflow: hidden;
                                    cursor: default;
                                    flex-shrink: 0;
                                    box-shadow: 0 3px 10px rgba(0,0,0,0.12);
                                ">
                                    ${avatarUrl 
                                        ? `<img src="${avatarUrl}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;">`
                                        : `<span style="font-size: 1rem;">${avatarInitials}</span>`}
                                </div>
                                <div style="display: flex; flex-direction: column; gap: 0.15rem; min-width: 0;">
                                    <div style="font-weight: 600; color: #1e293b; margin-bottom: 0; font-size: 1.05rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                        ${avaliadorNome}
                                    </div>
                                    <div style="font-size: 0.9rem; color: #64748b; display: flex; align-items: center; gap: 0.5rem;">
                                        <i class="fas fa-calendar"></i>
                                        ${dataFormatada}
                                    </div>
                                </div>
                            </div>
                            <div style="font-size: 1.5rem; display: flex; align-items: center; color: #fbbf24; gap: 0.35rem;">
                                ${starsHTML}
                            </div>
                        </div>
                        ${avaliacao.comentario ? `
                            <div style="
                                margin-top: 0.75rem;
                                padding-top: 0.75rem;
                                border-top: 1px solid #e5e7eb;
                            ">
                                <p style="margin: 0; color: #475569; font-size: 1rem; line-height: 1.6; font-style: italic;">
                                    "${avaliacao.comentario}"
                                </p>
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('');

            ratingsContainer.innerHTML = ratingsHTML;
        }

        // Montar modal
        modalContent.appendChild(header);
        modalContent.appendChild(ratingsContainer);
        overlay.appendChild(modalContent);

        // Adicionar ao body
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';

        // Fechar ao clicar no overlay
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
                document.body.style.overflow = '';
            }
        });

        // Adicionar animações CSS se não existirem
        if (!document.getElementById('ratings-modal-styles')) {
            const style = document.createElement('style');
            style.id = 'ratings-modal-styles';
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Realiza logout
     */
    logout() {
        const confirmed = confirm('Tem certeza que deseja sair?');
        if (!confirmed) return;

        if (window.authManager) {
            window.authManager.logout();
            // Redirecionar para index após logout
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            localStorage.clear();
            window.location.href = 'index.html';
        }
    }

    /**
     * Exibe notificação
     */
    showNotification(message, type = 'info') {
        // Usar o sistema de notificação do authManager se disponível
        if (window.authManager && window.authManager.showNotification) {
            window.authManager.showNotification(message, type);
        } else {
            // Fallback: alert simples
            alert(message);
        }
    }
}

// Função global para ver todas as avaliações (mantida para compatibilidade)
function viewAllRatings() {
    if (window.profileManager && window.profileManager.showAllRatings) {
        window.profileManager.showAllRatings();
    } else if (window.profileManager && window.profileManager.userRatings) {
        // Fallback se o método não existir
        window.profileManager.showAllRatings();
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.profileManager = new ProfileManager();
    
    // Força bruta - garantir que o nome seja atualizado
    setTimeout(() => {
        console.log('=== FORÇA BRUTA - Atualizando nome ===');
        const userNameElement = document.getElementById('profile-user-name');
        if (userNameElement && userNameElement.textContent === '') {
            if (window.authManager && window.authManager.getCurrentUser()) {
                const user = window.authManager.getCurrentUser();
                userNameElement.textContent = user.nome || 'Usuário';
                console.log('Nome atualizado via força bruta:', user.nome);
            }
        }
    }, 2000);
});