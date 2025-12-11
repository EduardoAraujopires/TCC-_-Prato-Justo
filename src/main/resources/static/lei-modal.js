// Modal da Lei 14.016/2020

// Handler para abrir o modal
function openLeiModalHandler(e) {
    e.preventDefault();
    e.stopPropagation();
    openLeiModal();
    return false;
}

// Função para inicializar listeners
function initLeiModalListeners() {
    // Usar delegação de eventos no document para capturar cliques mesmo em elementos adicionados depois
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a.lei-link, a[href*="lei-14016"], a[href*="lei-14"]');
        if (link) {
            e.preventDefault();
            e.stopPropagation();
            openLeiModal();
            return false;
        }
    });
}

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        initLeiModal();
        initLeiModalListeners();
    });
} else {
    // DOM já está pronto
    initLeiModal();
    initLeiModalListeners();
}

function initLeiModal() {
    // Criar o modal se não existir
    if (!document.getElementById('lei-modal')) {
        createLeiModal();
    }
}

function createLeiModal() {
    const modalHTML = `
        <div id="lei-modal" class="termos-modal-overlay">
            <div class="termos-modal-card">
                <div class="termos-modal-header">
                    <h2>
                        <i class="fas fa-scale-balanced"></i>
                        Lei nº 14.016/2020
                    </h2>
                    <button class="termos-modal-close" aria-label="Fechar">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="termos-modal-body">
                    <div class="termos-section">
                        <h3><i class="fas fa-bullseye"></i> Objetivo da Lei</h3>
                        <p>A Lei nº 14.016/2020, sancionada em 24 de junho de 2020, tem como objetivo principal combater o desperdício de alimentos e incentivar a doação de excedentes de alimentos para consumo humano.</p>
                        <p style="margin-top: 15px; font-weight: 600; color: #3498DB;">
                            Esta lei é a base jurídica que permite e incentiva a atuação da nossa plataforma, garantindo segurança jurídica tanto para doadores quanto para receptores de alimentos.
                        </p>
                    </div>

                    <div class="termos-section">
                        <h3><i class="fas fa-gavel"></i> Principais Disposições</h3>
                        <ul>
                            <li><strong>Art. 1º - Autorização de Doação:</strong> Autoriza a doação de excedentes de alimentos próprios para o consumo humano</li>
                            <li><strong>Art. 2º - Definição de Alimentos Próprios:</strong> Define alimentos próprios para consumo como aqueles dentro do prazo de validade e em condições adequadas</li>
                            <li><strong>Art. 3º - Responsabilidade do Doador:</strong> Estabelece que a doação não gera responsabilidade civil, penal ou administrativa ao doador quando realizada de boa-fé</li>
                            <li><strong>Art. 4º - Doação Direta:</strong> Permite a doação direta a pessoas em situação de vulnerabilidade</li>
                            <li><strong>Art. 5º - Boas Práticas:</strong> Determina que os alimentos devem seguir as boas práticas de fabricação e manipulação</li>
                        </ul>
                    </div>

                    <div class="termos-section">
                        <h3><i class="fas fa-shield-alt"></i> Boas Práticas de Segurança Alimentar</h3>
                        <p>Conforme estabelecido pela lei, todas as doações realizadas através do Prato Justo devem seguir rigorosamente as boas práticas de segurança alimentar:</p>
                        <ul>
                            <li><strong>Controle de Validade:</strong> Verificação rigorosa do prazo de validade dos produtos</li>
                            <li><strong>Armazenamento Adequado:</strong> Manutenção em condições adequadas de temperatura e umidade</li>
                            <li><strong>Embalagem Íntegra:</strong> Embalagem intacta e identificação clara dos produtos</li>
                            <li><strong>Transporte Seguro:</strong> Transporte adequado mantendo a cadeia de frio quando necessário</li>
                            <li><strong>Higienização:</strong> Higienização adequada dos manipuladores e ambiente</li>
                        </ul>
                    </div>

                    <div class="termos-section">
                        <h3><i class="fas fa-user-check"></i> Responsabilidades do Doador</h3>
                        <p>O doador, ao utilizar a plataforma Prato Justo, declara que:</p>
                        <ul>
                            <li>Os alimentos estão dentro do prazo de validade</li>
                            <li>As condições de conservação são adequadas</li>
                            <li>As informações fornecidas são verdadeiras e completas</li>
                            <li>O alimento está próprio para consumo humano</li>
                        </ul>
                        <p style="margin-top: 15px; font-weight: 600; color: #27AE60; padding: 15px; background: #EBF5FB; border-radius: 8px; border-left: 4px solid #27AE60;">
                            <i class="fas fa-info-circle"></i> A boa-fé do doador é presumida pela lei, desde que seguidas as boas práticas estabelecidas. A doação realizada em conformidade com a Lei 14.016/2020 não gera responsabilidades ao doador.
                        </p>
                    </div>
                </div>
                <div class="termos-modal-footer">
                    <button class="termos-modal-btn" onclick="closeLeiModal()">
                        <i class="fas fa-check"></i> Entendi
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Event listeners para fechar o modal
    const modal = document.getElementById('lei-modal');
    const closeBtn = modal.querySelector('.termos-modal-close');
    
    closeBtn.addEventListener('click', closeLeiModal);
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeLeiModal();
        }
    });

    // Fechar com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeLeiModal();
        }
    });
}

function openLeiModal() {
    // Garantir que o modal existe
    if (!document.getElementById('lei-modal')) {
        createLeiModal();
    }
    
    const modal = document.getElementById('lei-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Scroll para o topo do modal
        const modalBody = modal.querySelector('.termos-modal-body');
        if (modalBody) {
            modalBody.scrollTop = 0;
        }
    }
}

function closeLeiModal() {
    const modal = document.getElementById('lei-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Exportar funções para uso global
window.openLeiModal = openLeiModal;
window.closeLeiModal = closeLeiModal;


