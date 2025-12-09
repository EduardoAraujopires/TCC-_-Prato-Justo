// ===== DETALHES DO ALIMENTO - JAVASCRIPT =====

// API Base URL - Usa configuração global se disponível, senão detecta automaticamente
const API_BASE_URL = window.API_BASE_URL || (() => {
    const protocol = window.location.protocol; // 'http:' ou 'https:'
    const hostname = window.location.hostname;
    const currentPort = window.location.port;
    
    // Detectar porta da API
    let apiPort = '';
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        // Desenvolvimento local - usar porta 8080
        apiPort = ':8080';
    } else {
        // Produção - usar a mesma porta da página
        if (currentPort && currentPort !== '80' && currentPort !== '443') {
            apiPort = `:${currentPort}`;
        } else {
            apiPort = ''; // Usa porta padrão do protocolo
        }
    }
    
    return `${protocol}//${hostname}${apiPort}`;
})();

// Elementos da página
const loadingElement = document.getElementById('loading');
const errorContainer = document.getElementById('error-container');
const mainContent = document.getElementById('main-content');
const errorMessage = document.getElementById('error-message');

// Modal
const modal = document.getElementById('modal-solicitar');
const modalClose = document.getElementById('modal-close');
const btnCancelar = document.getElementById('btn-cancelar');
const btnConfirmar = document.getElementById('btn-confirmar');

// Dados da doação atual
let currentDoacao = null;

/**
 * ===== INICIALIZAÇÃO =====
 */
document.addEventListener('DOMContentLoaded', function() {
    // Obter ID da doação da URL
    const urlParams = new URLSearchParams(window.location.search);
    const doacaoId = urlParams.get('id');
    
    if (!doacaoId) {
        showError('ID da doação não fornecido');
        return;
    }
    
    // Carregar detalhes da doação
    loadDoacaoDetails(doacaoId);
    
    // Event listeners para botões
    document.getElementById('btn-solicitar').addEventListener('click', openModal);
    document.getElementById('btn-compartilhar').addEventListener('click', shareDoacao);
    
    // Event listeners do modal
    modalClose.addEventListener('click', closeModal);
    btnCancelar.addEventListener('click', closeModal);
    btnConfirmar.addEventListener('click', confirmarSolicitacao);
    
    // Fechar modal ao clicar fora
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });
});

/**
 * ===== CARREGAR DETALHES DA DOAÇÃO =====
 */
async function loadDoacaoDetails(doacaoId) {
    try {
        showLoading();
        
        console.log('🔍 Carregando doação ID:', doacaoId);
        console.log('📍 URL da API:', `${API_BASE_URL}/doacoes/${doacaoId}`);
        
        const response = await fetch(`${API_BASE_URL}/doacoes/${doacaoId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📡 Status da resposta:', response.status);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Doação não encontrada. Verifique se o ID está correto.');
            }
            
            // Tentar ler mensagem de erro do servidor
            let errorMessage = 'Erro ao carregar detalhes da doação';
            try {
                const errorData = await response.text();
                console.error('❌ Erro do servidor:', errorData);
                if (errorData) {
                    errorMessage += ': ' + errorData;
                }
            } catch (e) {
                console.error('❌ Não foi possível ler mensagem de erro');
            }
            
            throw new Error(errorMessage);
        }
        
        const doacao = await response.json();
        console.log('✅ Doação carregada com sucesso:', doacao);
        
        currentDoacao = doacao;
        
        // Exibir detalhes
        displayDoacaoDetails(doacao);
        
        // Carregar avaliações (se disponível)
        loadReviews(doacaoId);
        
    } catch (error) {
        console.error('❌ Erro ao carregar doação:', error);
        console.error('Stack trace:', error.stack);
        showError(error.message || 'Erro desconhecido ao carregar a doação');
    } finally {
        hideLoading();
    }
}

/**
 * ===== EXIBIR DETALHES DA DOAÇÃO =====
 */
function displayDoacaoDetails(doacao) {
    // Imagem principal
    const mainImage = document.getElementById('main-image');
    if (doacao.imagem) {
        mainImage.src = doacao.imagem;
        mainImage.alt = doacao.titulo;
    } else {
        mainImage.src = 'img/frutas.jpg'; // Imagem padrão
        mainImage.alt = 'Imagem não disponível';
    }
    
    // Status badge
    const statusBadge = document.getElementById('status-badge');
    const statusInfo = getStatusInfo(doacao.dataValidade);
    statusBadge.textContent = statusInfo.text;
    statusBadge.className = `status-badge ${statusInfo.class}`;
    
    // Tipo do produto
    const tipoLabel = getTipoLabel(doacao.tipoAlimento);
    document.getElementById('product-type').textContent = tipoLabel;
    
    // Título
    document.getElementById('product-title').textContent = doacao.titulo || 'Alimento para Doação';
    
    // Descrição
    document.getElementById('product-description').textContent = 
        doacao.descricao || 'Descrição não disponível';
    
    // Quantidade
    document.getElementById('product-quantity').textContent = 
        `${doacao.quantidade || 'N/A'}${doacao.unidade ? ' ' + doacao.unidade : ''}`;
    
    // Validade
    const dataValidade = doacao.dataValidade 
        ? new Date(doacao.dataValidade + 'T00:00:00').toLocaleDateString('pt-BR')
        : 'Não informado';
    document.getElementById('product-validade').textContent = dataValidade;
    
    // Tempo restante
    const diasRestantes = calculateDaysRemaining(doacao.dataValidade);
    document.getElementById('product-tempo').textContent = diasRestantes;
    
    // Data de coleta (se disponível)
    if (doacao.dataColeta) {
        const coletaCard = document.getElementById('coleta-card');
        coletaCard.style.display = 'flex';
        const dataColeta = new Date(doacao.dataColeta + 'T00:00:00').toLocaleDateString('pt-BR');
        document.getElementById('product-coleta').textContent = dataColeta;
    }
    
    // Localização
    displayLocation(doacao);
    
    // Informações do doador
    displayDonorInfo(doacao);
    
    // Verificar se o usuário é o dono e ocultar botão de solicitar se for
    checkIfUserIsOwner(doacao);
    
    // Verificar se há solicitações concluídas e mostrar ícone de avaliação
    setTimeout(() => {
        checkCompletedRequestsAndShowIcon(doacao);
    }, 1000);
    
    // Expor função globalmente para teste manual
    window.testarAvaliacao = function() {
        console.log('[Avaliação] Teste manual - verificando elementos...');
        const evaluationSection = document.getElementById('evaluation-section');
        if (evaluationSection) {
            evaluationSection.style.display = 'block';
            console.log('[Avaliação] Seção de avaliação exibida manualmente');
            alert('Seção de avaliação exibida! Verifique na página.');
        } else {
            console.error('[Avaliação] Elemento evaluation-section não encontrado!');
            alert('Elemento não encontrado no DOM!');
        }
    };
    
    // Exibir conteúdo principal
    mainContent.style.display = 'block';
}

/**
 * ===== EXIBIR LOCALIZAÇÃO =====
 */
function displayLocation(doacao) {
    const locationAddress = document.getElementById('location-address');
    const locationCity = document.getElementById('location-city');
    
    // Montar endereço completo
    let enderecoCompleto = '';
    if (doacao.rua) {
        enderecoCompleto = doacao.rua;
        if (doacao.numero) enderecoCompleto += `, ${doacao.numero}`;
        if (doacao.complemento) enderecoCompleto += ` - ${doacao.complemento}`;
    } else if (doacao.endereco) {
        enderecoCompleto = doacao.endereco;
    }
    
    locationAddress.textContent = enderecoCompleto || 'Endereço não informado';
    
    let cidadeCompleta = '';
    if (doacao.cidade) {
        cidadeCompleta = doacao.cidade;
        if (doacao.estado) cidadeCompleta += ` - ${doacao.estado}`;
        if (doacao.cep) cidadeCompleta += ` | CEP: ${doacao.cep}`;
    }
    
    locationCity.textContent = cidadeCompleta || 'Cidade não informada';
    
    // Se tiver coordenadas, exibir mapa (implementação futura)
    if (doacao.latitude && doacao.longitude) {
        const mapContainer = document.getElementById('map-container');
        mapContainer.style.display = 'block';
        // Aqui você pode integrar com Google Maps, Leaflet, etc.
        mapContainer.innerHTML = `
            <div style="width: 100%; height: 100%; background-color: #e5e7eb; display: flex; align-items: center; justify-content: center; color: #6b7280;">
                <div style="text-align: center;">
                    <i class="fas fa-map-marked-alt" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
                    <p>Mapa: ${doacao.latitude.toFixed(6)}, ${doacao.longitude.toFixed(6)}</p>
                    <p style="font-size: 0.9rem;">Integração com mapa em desenvolvimento</p>
                </div>
            </div>
        `;
    }
}

/**
 * ===== VERIFICAR SE USUÁRIO É O DONO =====
 */
function checkIfUserIsOwner(doacao) {
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('user');
    const btnSolicitar = document.getElementById('btn-solicitar');
    
    if (!btnSolicitar) return;
    
    // Se não estiver logado, manter botão visível (será tratado no modal)
    if (!token || !userInfo) {
        return;
    }
    
    try {
        const user = JSON.parse(userInfo);
        
        // Verificar se o usuário é o dono da doação
        if (doacao.doador && doacao.doador.id && user.id && doacao.doador.id === user.id) {
            // Usuário é o dono, ocultar botão de solicitar
            btnSolicitar.style.display = 'none';
        } else {
            // Usuário não é o dono, mostrar botão
            btnSolicitar.style.display = 'block';
        }
    } catch (e) {
        console.error('Erro ao verificar se usuário é dono:', e);
        // Em caso de erro, manter botão visível
    }
}

/**
 * ===== EXIBIR INFORMAÇÕES DO DOADOR =====
 */
function displayDonorInfo(doacao) {
    const donorAvatarImg = document.getElementById('donor-avatar-img');
    const donorAvatarPlaceholder = document.getElementById('donor-avatar-placeholder');
    const donorName = document.getElementById('donor-name');
    const donorType = document.getElementById('donor-type');
    
    let nome = 'Doador Anônimo';
    let tipo = 'Pessoa física';
    let avatarUrl = null;
    
    if (doacao.doador) {
        nome = doacao.doador.nome || 'Doador';
        tipo = getTipoUsuarioLabel(doacao.doador.tipoUsuario);
        // Usar avatarUrl (padrão do sistema) ou avatar (fallback)
        avatarUrl = doacao.doador.avatarUrl || doacao.doador.avatar || null;
    } else if (doacao.estabelecimento) {
        nome = doacao.estabelecimento.nome || 'Estabelecimento';
        tipo = 'Estabelecimento';
        avatarUrl = doacao.estabelecimento.logo || null;
    }
    
    // Obter inicial do nome para placeholder
    const inicial = nome.charAt(0).toUpperCase();
    
    // Configurar avatar (mesma lógica do sistema de perfil)
    if (avatarUrl && donorAvatarImg && donorAvatarPlaceholder) {
        // Configurar handler de erro se ainda não foi configurado
        if (!donorAvatarImg.hasAttribute('data-error-handler')) {
            donorAvatarImg.setAttribute('data-error-handler', 'true');
            donorAvatarImg.addEventListener('error', () => {
                console.warn('Avatar do doador não encontrado:', avatarUrl);
                if (donorAvatarImg) donorAvatarImg.style.display = 'none';
                if (donorAvatarPlaceholder) {
                    donorAvatarPlaceholder.style.display = 'flex';
                    donorAvatarPlaceholder.textContent = inicial;
                    donorAvatarPlaceholder.querySelector('i')?.remove();
                }
            });
        }
        
        // Adicionar cache-busting para garantir que a imagem atualize
        const updatedAt = localStorage.getItem('avatarUpdatedAt');
        const urlWithVersion = avatarUrl + (avatarUrl.includes('?') ? '&' : '?') + 'v=' + (updatedAt || Date.now());
        donorAvatarImg.src = urlWithVersion;
        donorAvatarImg.alt = nome;
        donorAvatarImg.style.display = 'block';
        donorAvatarPlaceholder.style.display = 'none';
    } else if (donorAvatarImg && donorAvatarPlaceholder) {
        // Sem avatar, mostrar inicial
        donorAvatarImg.style.display = 'none';
        donorAvatarPlaceholder.style.display = 'flex';
        // Remover ícone e adicionar inicial
        const icon = donorAvatarPlaceholder.querySelector('i');
        if (icon) icon.remove();
        donorAvatarPlaceholder.textContent = inicial;
    }
    
    donorName.textContent = nome;
    donorType.textContent = tipo;
}

/**
 * ===== ABRIR MODAL DE SOLICITAÇÃO =====
 */
function openModal() {
    if (!currentDoacao) return;
    
    // Preencher dados do modal
    const modalImage = document.getElementById('modal-image');
    modalImage.src = currentDoacao.imagem || 'img/frutas.jpg';
    
    document.getElementById('modal-title').textContent = currentDoacao.titulo;
    
    const doadorNome = currentDoacao.doador?.nome || 
                       currentDoacao.estabelecimento?.nome || 
                       'Doador Anônimo';
    document.getElementById('modal-donor').textContent = `Doador: ${doadorNome}`;
    
    // Exibir modal
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

/**
 * ===== FECHAR MODAL =====
 */
function closeModal() {
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

/**
 * ===== CONFIRMAR SOLICITAÇÃO =====
 */
async function confirmarSolicitacao() {
    if (!currentDoacao) return;
    
    const token = localStorage.getItem('token');
    
    if (!token) {
        alert('Você precisa fazer login para solicitar uma doação.');
        window.location.href = 'login.html';
        return;
    }
    
    try {
        btnConfirmar.disabled = true;
        btnConfirmar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
        
        const response = await fetch(`${API_BASE_URL}/doacoes/${currentDoacao.id}/solicitar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            let errorMessage = 'Erro ao solicitar doação';
            const contentType = response.headers.get('content-type');
            
            try {
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    // Tentar extrair mensagem de diferentes formatos possíveis
                    if (typeof errorData === 'string') {
                        errorMessage = errorData;
                    } else if (errorData.message) {
                        errorMessage = errorData.message;
                    } else if (errorData.error) {
                        errorMessage = errorData.error;
                    } else if (typeof errorData === 'object') {
                        // Se for um objeto, tentar converter para string útil
                        errorMessage = JSON.stringify(errorData);
                    } else {
                        errorMessage = String(errorData);
                    }
                } else {
                    // Se não for JSON, tentar ler como texto
                    const errorText = await response.text();
                    errorMessage = errorText || errorMessage;
                }
            } catch (e) {
                console.error('Erro ao processar resposta de erro:', e);
                errorMessage = `Erro ${response.status}: ${response.statusText}`;
            }
            
            throw new Error(errorMessage);
        }
        
        // Sucesso
        const result = await response.json();
        closeModal();
        showSuccessMessage('Solicitação enviada com sucesso!');
        
        // Redirecionar após 2 segundos
        setTimeout(() => {
            window.location.href = 'solicitacoes.html';
        }, 2000);
        
    } catch (error) {
        console.error('Erro ao solicitar doação:', error);
        
        // Extrair mensagem de erro de forma mais robusta
        let errorMessage = 'Erro ao solicitar doação';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        } else if (error && typeof error === 'object') {
            // Se for um objeto, tentar extrair mensagem
            if (error.message) {
                errorMessage = error.message;
            } else if (error.error) {
                errorMessage = error.error;
            } else {
                // Último recurso: converter objeto para string legível
                try {
                    errorMessage = JSON.stringify(error);
                } catch (e) {
                    errorMessage = String(error);
                }
            }
        }
        
        alert('Erro ao solicitar doação: ' + errorMessage);
    } finally {
        btnConfirmar.disabled = false;
        btnConfirmar.innerHTML = '<i class="fas fa-check"></i> Confirmar Solicitação';
    }
}

/**
 * ===== COMPARTILHAR DOAÇÃO =====
 */
function shareDoacao() {
    if (!currentDoacao) return;
    
    const shareUrl = window.location.href;
    const shareText = `Confira esta doação: ${currentDoacao.titulo}`;
    
    // Tentar usar Web Share API
    if (navigator.share) {
        navigator.share({
            title: currentDoacao.titulo,
            text: shareText,
            url: shareUrl
        }).then(() => {
            console.log('Compartilhado com sucesso');
        }).catch((error) => {
            console.log('Erro ao compartilhar:', error);
            fallbackShare(shareUrl);
        });
    } else {
        fallbackShare(shareUrl);
    }
}

/**
 * ===== FALLBACK PARA COMPARTILHAMENTO =====
 */
function fallbackShare(url) {
    // Copiar URL para clipboard
    navigator.clipboard.writeText(url).then(() => {
        alert('Link copiado para a área de transferência!');
    }).catch(() => {
        // Fallback manual
        prompt('Copie o link abaixo:', url);
    });
}

/**
 * ===== CARREGAR AVALIAÇÕES =====
 */
async function loadReviews(doacaoId) {
    try {
        // Tentar carregar avaliações (endpoint pode não existir ainda)
        const response = await fetch(`${API_BASE_URL}/avaliacoes/doacao/${doacaoId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const reviews = await response.json();
            displayReviews(reviews);
        } else {
            // Se não houver endpoint de avaliações, ocultar seção
            document.getElementById('reviews-section').style.display = 'none';
        }
    } catch (error) {
        // Ocultar seção de avaliações se houver erro
        document.getElementById('reviews-section').style.display = 'none';
    }
}

/**
 * ===== EXIBIR AVALIAÇÕES =====
 */
function displayReviews(reviews) {
    const reviewsList = document.getElementById('reviews-list');
    const reviewsSummary = document.getElementById('reviews-summary');
    
    if (!reviews || reviews.length === 0) {
        reviewsList.innerHTML = `
            <div class="no-reviews">
                <i class="fas fa-comment-slash"></i>
                <p>Ainda não há avaliações para esta doação.</p>
            </div>
        `;
        return;
    }
    
    // Calcular média de avaliações
    const totalRating = reviews.reduce((sum, review) => sum + (review.nota || 0), 0);
    const averageRating = (totalRating / reviews.length).toFixed(1);
    
    // Exibir resumo
    reviewsSummary.innerHTML = `
        <div class="rating-average">${averageRating}</div>
        <div class="rating-stars">${getStarsHTML(averageRating)}</div>
        <div class="rating-count">${reviews.length} avaliação(ões)</div>
    `;
    
    // Exibir avaliações
    reviewsList.innerHTML = reviews.map(review => `
        <div class="review-item">
            <div class="review-header">
                <div class="reviewer-info">
                    <div class="reviewer-avatar">
                        ${review.usuario?.nome?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                        <div class="reviewer-name">${review.usuario?.nome || 'Usuário'}</div>
                        <div class="review-rating">${getStarsHTML(review.nota)}</div>
                    </div>
                </div>
            </div>
            <p class="review-text">${review.comentario || 'Sem comentários'}</p>
        </div>
    `).join('');
}

/**
 * ===== GERAR HTML DE ESTRELAS =====
 */
function getStarsHTML(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let html = '';
    for (let i = 0; i < fullStars; i++) {
        html += '<i class="fas fa-star"></i>';
    }
    if (hasHalfStar) {
        html += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        html += '<i class="far fa-star"></i>';
    }
    
    return html;
}

/**
 * ===== OBTER INFORMAÇÕES DE STATUS =====
 */
function getStatusInfo(dataValidade) {
    if (!dataValidade) {
        return { text: 'Disponível', class: 'available' };
    }
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataVal = new Date(dataValidade + 'T00:00:00');
    dataVal.setHours(0, 0, 0, 0);
    
    const diasRestantes = Math.ceil((dataVal - hoje) / (1000 * 60 * 60 * 24));
    
    if (diasRestantes < 0) {
        return { text: 'Vencido', class: 'expired' };
    } else if (diasRestantes <= 3) {
        return { text: 'Urgente', class: 'urgent' };
    } else {
        return { text: 'Disponível', class: 'available' };
    }
}

/**
 * ===== CALCULAR DIAS RESTANTES =====
 */
function calculateDaysRemaining(dataValidade) {
    if (!dataValidade) {
        return 'Não informado';
    }
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataVal = new Date(dataValidade + 'T00:00:00');
    dataVal.setHours(0, 0, 0, 0);
    
    const diasRestantes = Math.ceil((dataVal - hoje) / (1000 * 60 * 60 * 24));
    
    if (diasRestantes < 0) {
        return 'Vencido';
    } else if (diasRestantes === 0) {
        return 'Vence hoje';
    } else if (diasRestantes === 1) {
        return '1 dia';
    } else {
        return `${diasRestantes} dias`;
    }
}

/**
 * ===== OBTER LABEL DO TIPO DE ALIMENTO =====
 */
function getTipoLabel(tipo) {
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
    
    return tipoLabels[tipo] || tipo || 'Alimento';
}

/**
 * ===== OBTER LABEL DO TIPO DE USUÁRIO =====
 */
function getTipoUsuarioLabel(tipo) {
    const tipoLabels = {
        'PESSOA_FISICA': 'Pessoa Física',
        'ONG': 'ONG',
        'EMPRESA': 'Empresa',
        'ESTABELECIMENTO': 'Estabelecimento'
    };
    
    return tipoLabels[tipo] || 'Pessoa Física';
}

/**
 * ===== EXIBIR MENSAGEM DE SUCESSO =====
 */
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-notification';
    successDiv.innerHTML = `
        <div style="background-color: #10b981; color: white; padding: 1rem 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 0.75rem; position: fixed; top: 100px; right: 2rem; z-index: 1001; animation: slideIn 0.3s ease;">
            <i class="fas fa-check-circle" style="font-size: 1.5rem;"></i>
            <span style="font-weight: 600;">${message}</span>
        </div>
    `;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

/**
 * ===== FUNÇÕES DE UI =====
 */
function showLoading() {
    loadingElement.style.display = 'flex';
    errorContainer.style.display = 'none';
    mainContent.style.display = 'none';
}

function hideLoading() {
    loadingElement.style.display = 'none';
}

function showError(message) {
    errorMessage.textContent = message;
    errorContainer.style.display = 'flex';
    loadingElement.style.display = 'none';
    mainContent.style.display = 'none';
}

/**
 * ===== VERIFICAR SOLICITAÇÕES CONCLUÍDAS E MOSTRAR ÍCONE DE AVALIAÇÃO (SIMPLIFICADO) =====
 */
async function checkCompletedRequestsAndShowIcon(doacao) {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        // Buscar solicitações da doação
        const response = await fetch(`${API_BASE_URL}/doacoes/${doacao.id}/solicitacoes`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) return;

        const solicitacoes = await response.json();
        
        // Buscar usuário atual
        const userResponse = await fetch(`${API_BASE_URL}/api/user/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!userResponse.ok) return;

        const currentUser = await userResponse.json();
        
        // Verificar se há solicitação concluída
        const completedRequest = solicitacoes.find(s => {
            const status = s.status?.toLowerCase();
            return (status === 'concluida' || status === 'concluída' || status === 'concluido') &&
                   ((s.solicitante && s.solicitante.id === currentUser.id) ||
                    (doacao.doador && doacao.doador.id === currentUser.id));
        });

        if (completedRequest) {
            // Verificar se já avaliou
            const avaliacoesResponse = await fetch(`${API_BASE_URL}/avaliacoes-solicitacao/solicitacao/${completedRequest.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            let jaAvaliou = false;
            if (avaliacoesResponse.ok) {
                const avaliacoes = await avaliacoesResponse.json();
                jaAvaliou = avaliacoes.some(a => a.avaliador && a.avaliador.id === currentUser.id);
            }

            if (!jaAvaliou) {
                showEvaluationIcon(completedRequest.id, doacao);
            }
        }
    } catch (error) {
        console.error('Erro ao verificar solicitações:', error);
    }
}

/**
 * ===== MOSTRAR ÍCONE DE AVALIAÇÃO (SIMPLIFICADO) =====
 */
function showEvaluationIcon(solicitacaoId, doacao) {
    // Remover ícone existente se houver
    const existingIcon = document.getElementById('evaluation-icon-badge');
    if (existingIcon) {
        existingIcon.remove();
    }

    // Criar ícone flutuante simples
    const iconBadge = document.createElement('button');
    iconBadge.id = 'evaluation-icon-badge';
    iconBadge.innerHTML = '<i class="fas fa-star"></i> Avaliar';
    iconBadge.type = 'button';
    
    // Estilos inline simples com tema do projeto
    Object.assign(iconBadge.style, {
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
        color: 'white',
        border: 'none',
        padding: '1rem 1.5rem',
        borderRadius: '50px',
        boxShadow: '0 8px 25px rgba(220, 38, 38, 0.4)',
        cursor: 'pointer',
        zIndex: '9999',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontWeight: '600',
        fontSize: '1rem',
        fontFamily: 'inherit',
        transition: 'all 0.3s ease',
        animation: 'bounceIn 0.6s ease'
    });

    // Hover effect
    iconBadge.onmouseenter = () => {
        iconBadge.style.transform = 'scale(1.1) translateY(-5px)';
        iconBadge.style.boxShadow = '0 12px 35px rgba(220, 38, 38, 0.5)';
    };
    iconBadge.onmouseleave = () => {
        iconBadge.style.transform = 'scale(1) translateY(0)';
        iconBadge.style.boxShadow = '0 8px 25px rgba(220, 38, 38, 0.4)';
    };

    // Ao clicar, abrir modal de avaliação
    iconBadge.onclick = () => {
        if (typeof window.showEvaluationModal === 'function') {
            window.showEvaluationModal(solicitacaoId);
        } else {
            alert('Sistema de avaliação não disponível. Recarregue a página.');
        }
    };

    document.body.appendChild(iconBadge);

    // Adicionar animação CSS se não existir
    if (!document.getElementById('evaluation-icon-animations')) {
        const style = document.createElement('style');
        style.id = 'evaluation-icon-animations';
        style.textContent = `
            @keyframes bounceIn {
                0% { opacity: 0; transform: scale(0.3); }
                50% { opacity: 1; transform: scale(1.1); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * ===== VERIFICAR SOLICITAÇÕES CONCLUÍDAS E MOSTRAR AVALIAÇÃO (VERSÃO COMPLETA) =====
 */
async function checkCompletedRequests(doacao) {
    console.log('[Avaliação] checkCompletedRequests chamado para doação:', doacao.id);
    
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('[Avaliação] Token não encontrado');
        return;
    }

    try {
        // Buscar solicitações da doação
        console.log('[Avaliação] Buscando solicitações da doação...');
        const response = await fetch(`${API_BASE_URL}/doacoes/${doacao.id}/solicitacoes`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            console.log('[Avaliação] Erro ao buscar solicitações:', response.status);
            return;
        }

        const solicitacoes = await response.json();
        console.log('[Avaliação] Solicitações encontradas:', solicitacoes);
        
        // Buscar usuário atual
        console.log('[Avaliação] Buscando usuário atual...');
        const userResponse = await fetch(`${API_BASE_URL}/api/user/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!userResponse.ok) {
            console.log('[Avaliação] Erro ao buscar usuário:', userResponse.status);
            return;
        }

        const currentUser = await userResponse.json();
        console.log('[Avaliação] Usuário atual:', currentUser.id);
        console.log('[Avaliação] Doador da doação:', doacao.doador?.id);
        
        // Verificar se há solicitação concluída onde o usuário atual participou
        const completedRequest = solicitacoes.find(s => {
            const status = s.status?.toLowerCase();
            const isConcluida = status === 'concluida' || status === 'concluída' || status === 'concluido';
            const isParticipante = 
                (s.solicitante && s.solicitante.id === currentUser.id) ||
                (doacao.doador && doacao.doador.id === currentUser.id);
            
            console.log('[Avaliação] Verificando solicitação:', {
                id: s.id,
                status: s.status,
                statusLower: status,
                isConcluida,
                solicitanteId: s.solicitante?.id,
                doadorId: doacao.doador?.id,
                currentUserId: currentUser.id,
                isParticipante
            });
            
            return isConcluida && isParticipante;
        });
        
        // Se não encontrou, tentar buscar todas as solicitações do usuário
        if (!completedRequest && solicitacoes.length > 0) {
            console.log('[Avaliação] Tentando buscar solicitações do usuário...');
            try {
                const minhasSolicitacoesResponse = await fetch(`${API_BASE_URL}/doacoes/minhas-solicitacoes`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (minhasSolicitacoesResponse.ok) {
                    const minhasSolicitacoes = await minhasSolicitacoesResponse.json();
                    const minhaSolicitacaoConcluida = minhasSolicitacoes.find(s => {
                        const status = s.status?.toLowerCase();
                        const isConcluida = status === 'concluida' || status === 'concluída' || status === 'concluido';
                        const isDaDoacao = s.doacao && s.doacao.id === doacao.id;
                        return isConcluida && isDaDoacao;
                    });
                    
                    if (minhaSolicitacaoConcluida) {
                        console.log('[Avaliação] Encontrada solicitação concluída nas minhas solicitações:', minhaSolicitacaoConcluida);
                        // Usar a solicitação encontrada
                        const completedRequestFromList = solicitacoes.find(s => s.id === minhaSolicitacaoConcluida.id);
                        if (completedRequestFromList) {
                            const avaliacoesResponse = await fetch(`${API_BASE_URL}/avaliacoes-solicitacao/solicitacao/${completedRequestFromList.id}`, {
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                }
                            });

                            let jaAvaliou = false;
                            if (avaliacoesResponse.ok) {
                                const avaliacoes = await avaliacoesResponse.json();
                                jaAvaliou = avaliacoes.some(a => a.avaliador && a.avaliador.id === currentUser.id);
                            }

                            if (!jaAvaliou) {
                                showEvaluationSection(completedRequestFromList, doacao, currentUser);
                                return;
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('[Avaliação] Erro ao buscar minhas solicitações:', error);
            }
        }

        console.log('[Avaliação] Solicitação concluída encontrada?', !!completedRequest);

        if (completedRequest) {
            console.log('[Avaliação] ✅ Solicitação concluída encontrada:', completedRequest);
            
            // Verificar se já avaliou
            const avaliacoesResponse = await fetch(`${API_BASE_URL}/avaliacoes-solicitacao/solicitacao/${completedRequest.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            let jaAvaliou = false;
            if (avaliacoesResponse.ok) {
                const avaliacoes = await avaliacoesResponse.json();
                jaAvaliou = avaliacoes.some(a => a.avaliador && a.avaliador.id === currentUser.id);
                console.log('[Avaliação] Já avaliou?', jaAvaliou, 'Total de avaliações:', avaliacoes.length);
            }

            if (!jaAvaliou) {
                console.log('[Avaliação] ✅ Mostrando seção de avaliação...');
                showEvaluationSection(completedRequest, doacao, currentUser);
            } else {
                console.log('[Avaliação] ⚠️ Usuário já avaliou esta solicitação');
            }
        } else {
            console.log('[Avaliação] ⚠️ Nenhuma solicitação concluída encontrada para este usuário');
            console.log('[Avaliação] Total de solicitações:', solicitacoes.length);
            if (solicitacoes.length > 0) {
                console.log('[Avaliação] Status das solicitações:', solicitacoes.map(s => ({ 
                    id: s.id, 
                    status: s.status,
                    solicitanteId: s.solicitante?.id,
                    doadorId: doacao.doador?.id
                })));
            }
        }
    } catch (error) {
        console.error('[Avaliação] Erro ao verificar solicitações concluídas:', error);
        console.error('[Avaliação] Stack:', error.stack);
    }
}

/**
 * ===== VERSÃO SIMPLIFICADA - SEMPRE MOSTRAR SEÇÃO DE AVALIAÇÃO (PARA TESTE) =====
 */
function showEvaluationSectionSimplified(doacao) {
    console.log('[Avaliação] 🧪 VERSÃO SIMPLIFICADA - Mostrando seção de avaliação sempre');
    
    const evaluationSection = document.getElementById('evaluation-section');
    const evaluationInfo = document.getElementById('evaluation-info');
    const btnAvaliar = document.getElementById('btn-avaliar');

    if (!evaluationSection || !evaluationInfo || !btnAvaliar) {
        console.error('[Avaliação] ❌ Elementos não encontrados:', {
            evaluationSection: !!evaluationSection,
            evaluationInfo: !!evaluationInfo,
            btnAvaliar: !!btnAvaliar
        });
        return;
    }

    // Preencher informações com dados básicos
    const doadorNome = doacao.doador?.nome || 'Doador';
    const dataAtual = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    evaluationInfo.innerHTML = `
        <div class="evaluation-details">
            <div class="evaluation-detail-item">
                <i class="fas fa-user"></i>
                <span><strong>Avaliar:</strong> ${doadorNome}</span>
            </div>
            <div class="evaluation-detail-item">
                <i class="fas fa-calendar-check"></i>
                <span><strong>Concluída em:</strong> ${dataAtual}</span>
            </div>
            <div class="evaluation-detail-item">
                <i class="fas fa-gift"></i>
                <span><strong>Doação:</strong> ${doacao.titulo || 'Doação'}</span>
            </div>
        </div>
    `;

    // Event listener para o botão de avaliar
    btnAvaliar.onclick = () => {
        console.log('[Avaliação] Botão de avaliar clicado');
        // Tentar buscar a primeira solicitação concluída ou usar um ID padrão
        const token = localStorage.getItem('token');
        if (token) {
            fetch(`${API_BASE_URL}/doacoes/${doacao.id}/solicitacoes`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => response.json())
            .then(solicitacoes => {
                const concluida = solicitacoes.find(s => {
                    const status = s.status?.toLowerCase();
                    return status === 'concluida' || status === 'concluída' || status === 'concluido';
                });
                
                if (concluida && typeof window.showEvaluationModal === 'function') {
                    window.showEvaluationModal(concluida.id, concluida);
                } else {
                    alert('Solicitação concluída não encontrada. Por favor, vá até a página de solicitações para avaliar.');
                }
            })
            .catch(error => {
                console.error('[Avaliação] Erro ao buscar solicitação:', error);
                alert('Erro ao abrir avaliação. Por favor, tente novamente.');
            });
        } else {
            alert('Você precisa estar logado para avaliar.');
        }
    };

    // Mostrar seção com animação
    console.log('[Avaliação] ✅ Exibindo seção de avaliação (versão simplificada)...');
    evaluationSection.style.display = 'block';
    evaluationSection.style.visibility = 'visible';
    evaluationSection.style.opacity = '1';
    evaluationSection.style.animation = 'slideInUp 0.5s ease';
    
    // Scroll até a seção
    setTimeout(() => {
        evaluationSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 600);
}

/**
 * ===== MOSTRAR SEÇÃO DE AVALIAÇÃO =====
 */
function showEvaluationSection(solicitacao, doacao, currentUser) {
    console.log('[Avaliação] showEvaluationSection chamado');
    
    const evaluationSection = document.getElementById('evaluation-section');
    const evaluationInfo = document.getElementById('evaluation-info');
    const btnAvaliar = document.getElementById('btn-avaliar');

    console.log('[Avaliação] Elementos encontrados:', {
        evaluationSection: !!evaluationSection,
        evaluationInfo: !!evaluationInfo,
        btnAvaliar: !!btnAvaliar
    });

    if (!evaluationSection) {
        console.error('[Avaliação] ❌ evaluation-section não encontrado no DOM!');
        return;
    }
    
    if (!evaluationInfo) {
        console.error('[Avaliação] ❌ evaluation-info não encontrado no DOM!');
        return;
    }
    
    if (!btnAvaliar) {
        console.error('[Avaliação] ❌ btn-avaliar não encontrado no DOM!');
        return;
    }

    // Determinar quem deve ser avaliado
    const isDoador = doacao.doador && doacao.doador.id === currentUser.id;
    const avaliado = isDoador ? solicitacao.solicitante : doacao.doador;
    const avaliadoNome = avaliado ? avaliado.nome : 'Usuário';

    // Preencher informações
    const dataConclusao = solicitacao.atualizadoEm || solicitacao.criadoEm;
    const dataFormatada = dataConclusao 
        ? new Date(dataConclusao).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : 'Data não informada';

    evaluationInfo.innerHTML = `
        <div class="evaluation-details">
            <div class="evaluation-detail-item">
                <i class="fas fa-user"></i>
                <span><strong>Avaliar:</strong> ${avaliadoNome}</span>
            </div>
            <div class="evaluation-detail-item">
                <i class="fas fa-calendar-check"></i>
                <span><strong>Concluída em:</strong> ${dataFormatada}</span>
            </div>
            <div class="evaluation-detail-item">
                <i class="fas fa-gift"></i>
                <span><strong>Doação:</strong> ${doacao.titulo}</span>
            </div>
        </div>
    `;

    // Event listener para o botão de avaliar
    btnAvaliar.onclick = () => {
        if (typeof window.showEvaluationModal === 'function') {
            window.showEvaluationModal(solicitacao.id, solicitacao);
        } else if (typeof showEvaluationModal === 'function') {
            showEvaluationModal(solicitacao.id, solicitacao);
        } else {
            console.error('Função showEvaluationModal não encontrada');
            alert('Sistema de avaliação não disponível. Por favor, recarregue a página.');
        }
    };

    // Mostrar seção com animação
    console.log('[Avaliação] Exibindo seção de avaliação...');
    evaluationSection.style.display = 'block';
    evaluationSection.style.visibility = 'visible';
    evaluationSection.style.opacity = '1';
    evaluationSection.style.animation = 'slideInUp 0.5s ease';
    
    // Verificar se foi exibido
    setTimeout(() => {
        const isVisible = evaluationSection.offsetParent !== null;
        console.log('[Avaliação] Seção visível?', isVisible);
        console.log('[Avaliação] Display:', window.getComputedStyle(evaluationSection).display);
        console.log('[Avaliação] Visibility:', window.getComputedStyle(evaluationSection).visibility);
    }, 100);
}

// Adicionar estilos para animação
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideInUp {
        from {
            transform: translateY(30px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

