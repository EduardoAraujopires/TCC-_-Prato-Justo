// ===== DETALHES DO ALIMENTO - JAVASCRIPT =====

const API_BASE_URL = 'http://localhost:8080';

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
`;
document.head.appendChild(style);

