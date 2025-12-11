// Modal da Política de Privacidade

// Handler para abrir o modal
function openPoliticaModalHandler(e) {
    e.preventDefault();
    e.stopPropagation();
    openPoliticaModal();
    return false;
}

// Função para inicializar listeners
function initPoliticaModalListeners() {
    // Usar delegação de eventos no document para capturar cliques mesmo em elementos adicionados depois
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a.politica-link, a[href*="politica-privacidade"], a[href*="politica"]');
        if (link) {
            e.preventDefault();
            e.stopPropagation();
            openPoliticaModal();
            return false;
        }
    });
}

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        initPoliticaModal();
        initPoliticaModalListeners();
    });
} else {
    // DOM já está pronto
    initPoliticaModal();
    initPoliticaModalListeners();
}

function initPoliticaModal() {
    // Criar o modal se não existir
    if (!document.getElementById('politica-modal')) {
        createPoliticaModal();
    }
}

function createPoliticaModal() {
    const modalHTML = `
        <div id="politica-modal" class="termos-modal-overlay">
            <div class="termos-modal-card">
                <div class="termos-modal-header">
                    <h2>
                        <i class="fas fa-shield-alt"></i>
                        Política de Privacidade
                    </h2>
                    <button class="termos-modal-close" aria-label="Fechar">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="termos-modal-body">
                    <div class="termos-section">
                        <h3><i class="fas fa-info-circle"></i> 1. Coleta de Dados</h3>
                        <p>Coletamos os seguintes dados para operar a plataforma de forma segura e eficiente:</p>
                        <p><strong>Dados cadastrais (nome, email):</strong> Criação de conta e comunicação</p>
                        <p><strong>Endereço e localização:</strong> Georreferenciamento de doações</p>
                        <p><strong>Informações de alimentos:</strong> Catalogação e disponibilização</p>
                        <p><strong>Fotos dos alimentos:</strong> Validação e confiança na doação</p>
                    </div>

                    <div class="termos-section">
                        <h3><i class="fas fa-lock"></i> 2. Proteção de Dados</h3>
                        <p>Implementamos medidas de segurança para proteger seus dados:</p>
                        <ul>
                            <li>Criptografia de dados sensíveis</li>
                            <li>Controle de acesso baseado em funções</li>
                            <li>Monitoramento contínuo de segurança</li>
                            <li>Backups regulares</li>
                            <li>Anonimização de dados quando possível</li>
                            <li>Firewalls e sistemas de detecção de intrusão</li>
                        </ul>
                    </div>

                    <div class="termos-section">
                        <h3><i class="fas fa-hand-paper"></i> Consentimento</h3>
                        <p>Ao utilizar a plataforma Prato Justo, você consente com:</p>
                        <ul>
                            <li>Coleta e processamento dos dados conforme esta política</li>
                            <li>Compartilhamento limitado necessário para a operação</li>
                            <li>Armazenamento durante o uso da plataforma</li>
                            <li>Utilização para melhorias nos serviços</li>
                        </ul>
                    </div>

                    <div class="termos-section">
                        <h3><i class="fas fa-share-alt"></i> 3. Compartilhamento de Dados</h3>
                        <p>Seus dados podem ser compartilhados apenas:</p>
                        <ul>
                            <li><strong>Com outros usuários:</strong> Informações básicas para conexão (nome, localização aproximada)</li>
                            <li><strong>Com autoridades:</strong> Quando exigido por lei ou determinação judicial</li>
                            <li><strong>Com prestadores de serviço:</strong> Hospedagem, email marketing (com contrato de proteção de dados)</li>
                            <li><strong>Parceiros logísticos:</strong> Para entrega/retirada de alimentos</li>
                        </ul>
                        <p style="margin-top: 15px; font-weight: 600; color: #E74C3C; padding: 15px; background: #FDEDEC; border-radius: 8px; border-left: 4px solid #E74C3C;">
                            <i class="fas fa-exclamation-circle"></i> Não vendemos, alugamos ou comercializamos seus dados pessoais.
                        </p>
                    </div>

                    <div class="termos-section">
                        <h3><i class="fas fa-user-cog"></i> 4. Seus Direitos (LGPD)</h3>
                        <p>Conforme a Lei Geral de Proteção de Dados, você tem direito a:</p>
                        <ul>
                            <li>Confirmar a existência de tratamento de dados</li>
                            <li>Acessar seus dados</li>
                            <li>Corrigir dados incompletos ou desatualizados</li>
                            <li>Eliminar dados tratados com consentimento</li>
                            <li>Revogar o consentimento a qualquer momento</li>
                            <li>Portabilidade dos dados para outro fornecedor</li>
                            <li>Explicitação sobre como são usados seus dados</li>
                        </ul>
                    </div>

                    <div class="termos-section">
                        <h3><i class="fas fa-database"></i> 5. Retenção de Dados</h3>
                        <p>Mantemos seus dados apenas pelo tempo necessário para:</p>
                        <ul>
                            <li>Cumprir finalidades descritas nesta política</li>
                            <li>Atender obrigações legais ou regulatórias</li>
                            <li>Resolver disputas ou problemas técnicos</li>
                            <li>Proteger direitos e segurança da plataforma</li>
                        </ul>
                        <p style="margin-top: 15px;">Após o período de retenção, os dados são excluídos ou anonimizados.</p>
                    </div>

                    <div class="termos-section">
                        <h3><i class="fas fa-envelope"></i> 6. Contato do Encarregado</h3>
                        <p>Para exercer seus direitos ou esclarecer dúvidas sobre proteção de dados:</p>
                        <p style="padding: 15px; background: #EBF5FB; border-radius: 8px; border-left: 4px solid #3498DB;">
                            <strong><i class="fas fa-user-tie"></i> Encarregado de Proteção de Dados (DPO)</strong><br>
                            <strong>Email:</strong> dpo@pratojusto.org<br>
                            <strong>Endereço:</strong> Rua das Doações, 123 - Centro, São Paulo/SP<br>
                            <strong>Horário de atendimento:</strong> Segunda a sexta, das 9h às 17h<br>
                            <small style="color: #566573;">Responderemos sua solicitação em até 15 dias úteis.</small>
                        </p>
                    </div>
                </div>
                <div class="termos-modal-footer">
                    <button class="termos-modal-btn" onclick="closePoliticaModal()">
                        <i class="fas fa-check"></i> Entendi
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Event listeners para fechar o modal
    const modal = document.getElementById('politica-modal');
    const closeBtn = modal.querySelector('.termos-modal-close');
    
    closeBtn.addEventListener('click', closePoliticaModal);
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closePoliticaModal();
        }
    });

    // Fechar com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closePoliticaModal();
        }
    });
}

function openPoliticaModal() {
    // Garantir que o modal existe
    if (!document.getElementById('politica-modal')) {
        createPoliticaModal();
    }
    
    const modal = document.getElementById('politica-modal');
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

function closePoliticaModal() {
    const modal = document.getElementById('politica-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Exportar funções para uso global
window.openPoliticaModal = openPoliticaModal;
window.closePoliticaModal = closePoliticaModal;


