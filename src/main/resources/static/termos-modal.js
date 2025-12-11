// Modal de Termos de Uso

// Handler para abrir o modal
function openTermosModalHandler(e) {
    e.preventDefault();
    e.stopPropagation();
    openTermosModal();
    return false;
}

// Função para inicializar listeners
function initTermosModalListeners() {
    // Usar delegação de eventos no document para capturar cliques mesmo em elementos adicionados depois
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a.termos-link, a[href*="termos-de-uso"], a[href*="termos-uso"]');
        if (link) {
            e.preventDefault();
            e.stopPropagation();
            openTermosModal();
            return false;
        }
    });
}

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        initTermosModal();
        initTermosModalListeners();
    });
} else {
    // DOM já está pronto
    initTermosModal();
    initTermosModalListeners();
}

function initTermosModal() {
    // Criar o modal se não existir
    if (!document.getElementById('termos-modal')) {
        createTermosModal();
    }
}

function createTermosModal() {
    const modalHTML = `
        <div id="termos-modal" class="termos-modal-overlay">
            <div class="termos-modal-card">
                <div class="termos-modal-header">
                    <h2>
                        <i class="fas fa-file-contract"></i>
                        Termos de Uso
                    </h2>
                    <button class="termos-modal-close" aria-label="Fechar">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="termos-modal-body">
                    <div class="termos-section">
                        <h3><i class="fas fa-info-circle"></i> 1. Aceitação dos Termos</h3>
                        <p>Ao acessar e utilizar a plataforma Prato Justo, você concorda em cumprir e estar vinculado aos seguintes Termos de Uso. Se você não concorda com alguma parte destes termos, não deve utilizar nossa plataforma.</p>
                    </div>

                    <div class="termos-section">
                        <h3><i class="fas fa-users"></i> 2. Uso da Plataforma</h3>
                        <p>A plataforma Prato Justo tem como objetivo conectar doadores de alimentos com pessoas ou instituições que necessitam, promovendo a redução do desperdício alimentar e o combate à fome.</p>
                        <ul>
                            <li>Você deve ser maior de 18 anos ou ter autorização de responsável legal para utilizar a plataforma</li>
                            <li>É responsável por manter a confidencialidade de sua conta e senha</li>
                            <li>Deve fornecer informações verdadeiras e atualizadas</li>
                            <li>Não deve utilizar a plataforma para fins ilegais ou não autorizados</li>
                        </ul>
                    </div>

                    <div class="termos-section">
                        <h3><i class="fas fa-shield-alt"></i> 3. Responsabilidades do Doador</h3>
                        <p>Como doador, você se compromete a:</p>
                        <ul>
                            <li>Doar apenas alimentos que estejam em condições adequadas para consumo</li>
                            <li>Fornecer informações precisas sobre os alimentos (tipo, quantidade, validade)</li>
                            <li>Garantir que os alimentos não estejam vencidos ou deteriorados</li>
                            <li>Entregar os alimentos no prazo e local acordado</li>
                            <li>Ser responsável pela qualidade e segurança dos alimentos doados</li>
                        </ul>
                    </div>

                    <div class="termos-section">
                        <h3><i class="fas fa-hand-holding-heart"></i> 4. Responsabilidades do Receptor</h3>
                        <p>Como receptor, você se compromete a:</p>
                        <ul>
                            <li>Verificar a qualidade dos alimentos antes de aceitar a doação</li>
                            <li>Retirar os alimentos no prazo e local acordado</li>
                            <li>Utilizar os alimentos de forma adequada e responsável</li>
                            <li>Comunicar qualquer problema ou irregularidade</li>
                        </ul>
                    </div>

                    <div class="termos-section">
                        <h3><i class="fas fa-ban"></i> 5. Condutas Proibidas</h3>
                        <p>É expressamente proibido:</p>
                        <ul>
                            <li>Doar alimentos vencidos, deteriorados ou impróprios para consumo</li>
                            <li>Utilizar informações de outros usuários para fins não autorizados</li>
                            <li>Realizar atividades fraudulentas ou enganosas</li>
                            <li>Interferir no funcionamento da plataforma</li>
                            <li>Comercializar alimentos através da plataforma</li>
                            <li>Publicar conteúdo ofensivo, discriminatório ou ilegal</li>
                        </ul>
                    </div>

                    <div class="termos-section">
                        <h3><i class="fas fa-exclamation-triangle"></i> 6. Isenção de Responsabilidade</h3>
                        <p>A plataforma Prato Justo atua como intermediária entre doadores e receptores. Não nos responsabilizamos por:</p>
                        <ul>
                            <li>Qualidade, segurança ou condições dos alimentos doados</li>
                            <li>Danos decorrentes do consumo dos alimentos</li>
                            <li>Problemas na entrega ou retirada dos alimentos</li>
                            <li>Disputas entre usuários</li>
                        </ul>
                        <p style="margin-top: 15px; font-weight: 600; color: #E74C3C;">
                            A responsabilidade pela qualidade e segurança dos alimentos é exclusiva do doador.
                        </p>
                    </div>

                    <div class="termos-section">
                        <h3><i class="fas fa-gavel"></i> 7. Propriedade Intelectual</h3>
                        <p>Todo o conteúdo da plataforma, incluindo textos, imagens, logos e design, é de propriedade do Prato Justo e está protegido por leis de direitos autorais. É proibida a reprodução sem autorização prévia.</p>
                    </div>

                    <div class="termos-section">
                        <h3><i class="fas fa-edit"></i> 8. Modificações dos Termos</h3>
                        <p>Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento. As alterações entrarão em vigor imediatamente após a publicação. O uso continuado da plataforma após as modificações constitui aceitação dos novos termos.</p>
                    </div>

                    <div class="termos-section">
                        <h3><i class="fas fa-user-times"></i> 9. Encerramento de Conta</h3>
                        <p>Podemos suspender ou encerrar sua conta a qualquer momento, sem aviso prévio, em caso de violação destes Termos de Uso ou de qualquer conduta que consideremos inadequada.</p>
                    </div>

                    <div class="termos-section">
                        <h3><i class="fas fa-balance-scale"></i> 10. Lei Aplicável</h3>
                        <p>Estes Termos de Uso são regidos pelas leis brasileiras. Qualquer disputa será resolvida no foro da comarca de São Paulo/SP.</p>
                    </div>

                    <div class="termos-section">
                        <h3><i class="fas fa-envelope"></i> 11. Contato</h3>
                        <p>Para questões sobre estes Termos de Uso, entre em contato conosco:</p>
                        <p><strong>Email:</strong> contato@pratojusto.org</p>
                        <p><strong>Telefone:</strong> (11) 99999-9999</p>
                    </div>
                </div>
                <div class="termos-modal-footer">
                    <button class="termos-modal-btn" onclick="closeTermosModal()">
                        <i class="fas fa-check"></i> Entendi
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Event listeners para fechar o modal
    const modal = document.getElementById('termos-modal');
    const closeBtn = modal.querySelector('.termos-modal-close');
    
    closeBtn.addEventListener('click', closeTermosModal);
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeTermosModal();
        }
    });

    // Fechar com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeTermosModal();
        }
    });
}

function openTermosModal() {
    // Garantir que o modal existe
    if (!document.getElementById('termos-modal')) {
        createTermosModal();
    }
    
    const modal = document.getElementById('termos-modal');
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

function closeTermosModal() {
    const modal = document.getElementById('termos-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Exportar funções para uso global
window.openTermosModal = openTermosModal;
window.closeTermosModal = closeTermosModal;
