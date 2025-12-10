// Dependência: O 'showNotification' é esperado do arquivo notification.js (existente no projeto)

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('donationForm');
    const btnSubmit = document.getElementById('btnSubmit');
    const photoInput = document.getElementById('foodPhoto');
    const photoPreview = document.getElementById('photoPreview');
    const photoPreviewContainer = document.getElementById('photoPreviewContainer');
    const fileUploadArea = document.getElementById('fileUploadArea');
    const toggleBtn = document.getElementById('toggleOptional');
    const optionalContent = document.getElementById('optionalContent');
    const getLocationBtn = document.getElementById('getLocationBtn');
    const locationStatus = document.getElementById('locationStatus');
    const cepInput = document.getElementById('cep');
    const searchCepBtn = document.getElementById('searchCepBtn');
    const streetInput = document.getElementById('street');
    const numberInput = document.getElementById('number');
    const cityInput = document.getElementById('city');
    const stateInput = document.getElementById('state');
    const complementInput = document.getElementById('complement');
    const addressInput = document.getElementById('address');
    const expiryDateInput = document.getElementById('expiryDate');
    const collectionDateInput = document.getElementById('collectionDate');
    const progressFill = document.querySelector('.progress-fill');
    const steps = document.querySelectorAll('.step');

    // NOVOS ELEMENTOS ADICIONADOS
    const termsCheckbox = document.getElementById('terms');
    const privacyTermsCheckbox = document.getElementById('privacyTerms');
    const errorTerms = document.getElementById('error-terms');
    const errorPrivacyTerms = document.getElementById('error-privacyTerms');

    // Verificar se está em modo de edição
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    let isEditMode = false;
    let currentDonationId = null;

    if (editId) {
        isEditMode = true;
        currentDonationId = editId;
        loadDonationForEdit(editId);

        // Atualizar título da página
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) {
            heroTitle.innerHTML = '<span class="highlight">Editar Doação</span> de Alimento';
        }

        // Atualizar texto do botão
        if (btnSubmit) {
            btnSubmit.querySelector('.btn-text').textContent = 'Salvar Alterações';
        }

        // Atualizar badge
        const heroBadge = document.querySelector('.hero-badge');
        if (heroBadge) {
            heroBadge.innerHTML = '<i class="fas fa-edit"></i> Modo Edição';
            heroBadge.style.background = 'linear-gradient(135deg, #10b981, #3b82f6)';
        }
    }

    // --- Inicialização ---
    function init() {
        setupDateConstraints();
        setupEventListeners();
        updateProgress(1);
        startFoodAnimation();
    }

    // --- Animação de Alimentos ---
    function startFoodAnimation() {
        const foodIcons = document.querySelectorAll('.floating-food-background i');
        foodIcons.forEach((icon, index) => {
            // Configurações aleatórias para variedade
            const randomDelay = Math.random() * 5;
            const randomDuration = 20 + Math.random() * 10;
            const randomSize = 0.8 + Math.random() * 0.7;

            icon.style.animationDelay = `${randomDelay}s`;
            icon.style.animationDuration = `${randomDuration}s`;
            icon.style.fontSize = `${randomSize}rem`;
            icon.style.opacity = `${0.2 + Math.random() * 0.3}`;
        });
    }

    // --- Configurar datas mínimas ---
    function setupDateConstraints() {
        const hoje = new Date();
        const amanha = new Date(hoje);
        amanha.setDate(amanha.getDate() + 1);

        const hojeStr = hoje.toISOString().split('T')[0];
        const amanhaStr = amanha.toISOString().split('T')[0];

        collectionDateInput.setAttribute('min', hojeStr);
        expiryDateInput.setAttribute('min', amanhaStr);
    }

    // --- Configurar Event Listeners ---
    function setupEventListeners() {
        // CEP e endereço
        cepInput.addEventListener('input', formatCEP);
        searchCepBtn.addEventListener('click', handleCEPSearch);
        cepInput.addEventListener('blur', handleCEPBlur);

        // Atualização de endereço
        [streetInput, numberInput, cityInput, stateInput, complementInput].forEach(input => {
            input.addEventListener('input', generateFullAddress);
        });

        // Imagem
        photoInput.addEventListener('change', handleImageUpload);
        fileUploadArea.addEventListener('click', () => photoInput.click());
        fileUploadArea.addEventListener('dragover', handleDragOver);
        fileUploadArea.addEventListener('drop', handleFileDrop);

        // Seção opcional
        toggleBtn.addEventListener('click', toggleOptionalSection);

        // Geolocalização
        getLocationBtn.addEventListener('click', handleGeolocation);

        // Validação em tempo real
        setupRealTimeValidation();

        // Submissão do formulário
        form.addEventListener('submit', handleFormSubmit);

        // Atualizar progresso ao interagir com campos
        setupProgressTracking();

        // Event listeners para os checkboxes (validação em tempo real)
        if (termsCheckbox) {
            termsCheckbox.addEventListener('change', function() {
                if (this.checked) {
                    clearFieldError('terms');
                }
            });
        }

        if (privacyTermsCheckbox) {
            privacyTermsCheckbox.addEventListener('change', function() {
                if (this.checked) {
                    clearFieldError('privacyTerms');
                }
            });
        }
    }

    // --- Progress Steps ---
    function updateProgress(activeStep) {
        steps.forEach((step, index) => {
            if (index + 1 === activeStep) {
                step.classList.add('active');
            } else if (index + 1 < activeStep) {
                step.classList.add('completed');
            } else {
                step.classList.remove('active', 'completed');
            }
        });

        const progress = ((activeStep - 1) / (steps.length - 1)) * 100;
        progressFill.style.width = `${progress}%`;
    }

    function setupProgressTracking() {
        // Monitorar preenchimento de campos para atualizar progresso
        const essentialFields = ['foodName', 'foodType', 'description', 'quantity', 'unit'];
        const locationFields = ['cep', 'street', 'number', 'city', 'state', 'conservation'];

        essentialFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                element.addEventListener('input', () => checkStepCompletion(1));
            }
        });

        locationFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                element.addEventListener('input', () => checkStepCompletion(2));
            }
        });
    }

    function checkStepCompletion(step) {
        let isStepComplete = false;

        switch (step) {
            case 1:
                // Verificar se campos essenciais estão preenchidos
                const essentialFields = ['foodName', 'foodType', 'description', 'quantity', 'unit'];
                isStepComplete = essentialFields.every(field => {
                    const element = document.getElementById(field);
                    return element && element.value.trim() !== '';
                });
                break;

            case 2:
                // Verificar se campos de localização estão preenchidos
                const locationFields = ['cep', 'street', 'number', 'city', 'state', 'conservation'];
                isStepComplete = locationFields.every(field => {
                    const element = document.getElementById(field);
                    return element && element.value.trim() !== '';
                });
                break;
        }

        if (isStepComplete && step < 3) {
            updateProgress(step + 1);
        }
    }

    // --- Formatação de CEP ---
    function formatCEP(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 8) {
            value = value.substring(0, 8);
        }
        if (value.length > 5) {
            value = value.substring(0, 5) + '-' + value.substring(5, 8);
        }
        e.target.value = value;
    }

    // --- Busca de CEP ---
    async function searchAddressByCep(cep) {
        const cleanCep = cep.replace(/\D/g, '');

        if (cleanCep.length !== 8) {
            showNotification('CEP deve ter 8 dígitos.', 'error');
            return;
        }

        try {
            searchCepBtn.disabled = true;
            searchCepBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Buscando...';

            const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
            const data = await response.json();

            if (data.erro) {
                showNotification('CEP não encontrado.', 'error');
                return;
            }

            // Preenche os campos automaticamente
            streetInput.value = data.logradouro || '';
            cityInput.value = data.localidade || '';
            stateInput.value = data.uf || '';

            // Foca no campo número após preencher
            setTimeout(() => numberInput.focus(), 100);

            generateFullAddress();

            showNotification('Endereço encontrado com sucesso!', 'success');

            // Atualizar progresso
            checkStepCompletion(2);

        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            showNotification('Erro ao buscar CEP. Tente novamente.', 'error');
        } finally {
            searchCepBtn.disabled = false;
            searchCepBtn.innerHTML = '<i class="fas fa-search"></i> Buscar';
        }
    }

    function handleCEPSearch() {
        const cep = cepInput.value.trim();
        if (cep) {
            searchAddressByCep(cep);
        } else {
            showNotification('Digite um CEP válido.', 'error');
        }
    }

    function handleCEPBlur() {
        const cep = cepInput.value.trim();
        if (cep && cep.length === 9) {
            searchAddressByCep(cep);
        }
    }

    // --- Geração de Endereço Completo ---
    function generateFullAddress() {
        const street = streetInput.value.trim();
        const number = numberInput.value.trim();
        const city = cityInput.value.trim();
        const state = stateInput.value.trim();
        const complement = complementInput.value.trim();

        if (street && number && city && state) {
            let fullAddress = `${street}, ${number}`;
            if (complement) {
                fullAddress += `, ${complement}`;
            }
            fullAddress += `, ${city} - ${state}`;

            addressInput.value = fullAddress;
        }
    }

    // --- Upload de Imagem ---
    function handleImageUpload() {
        const file = this.files[0];
        if (file) {
            // Validação do arquivo
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            const maxSize = 5 * 1024 * 1024; // 5MB

            if (!validTypes.includes(file.type)) {
                showNotification('Por favor, selecione uma imagem JPG, PNG ou GIF.', 'error');
                this.value = '';
                return;
            }

            if (file.size > maxSize) {
                showNotification('A imagem deve ter no máximo 5MB.', 'error');
                this.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                photoPreview.src = e.target.result;
                photoPreview.style.display = 'block';
                photoPreviewContainer.querySelector('i').style.display = 'none';

                // Adicionar efeito visual
                photoPreviewContainer.style.borderColor = '#10b981';
                photoPreviewContainer.style.background = 'rgba(16, 185, 129, 0.1)';

                showNotification('Imagem carregada com sucesso!', 'success');
            };
            reader.readAsDataURL(file);
        } else {
            resetImagePreview();
        }
    }

    function handleDragOver(e) {
        e.preventDefault();
        fileUploadArea.style.borderColor = '#fbbf24';
        fileUploadArea.style.background = 'rgba(251, 191, 36, 0.1)';
    }

    function handleFileDrop(e) {
        e.preventDefault();
        fileUploadArea.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        fileUploadArea.style.background = 'rgba(255, 255, 255, 0.05)';

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            photoInput.files = files;
            handleImageUpload.call(photoInput);
        }
    }

    function resetImagePreview() {
        photoPreview.style.display = 'none';
        photoPreviewContainer.querySelector('i').style.display = 'block';
        photoPreviewContainer.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        photoPreviewContainer.style.background = 'rgba(255, 255, 255, 0.05)';
    }

    // --- Seção Opcional ---
    function toggleOptionalSection() {
        const isHidden = optionalContent.classList.toggle('hidden');
        const icon = toggleBtn.querySelector('i');

        if (isHidden) {
            icon.className = 'fas fa-chevron-down';
            toggleBtn.querySelector('span').textContent = 'Mostrar Mais Detalhes (Opcional)';
        } else {
            icon.className = 'fas fa-chevron-up';
            toggleBtn.querySelector('span').textContent = 'Ocultar Detalhes';
            optionalContent.classList.add('visible');
        }

        // Animar a abertura/fechamento
        optionalContent.style.display = isHidden ? 'none' : 'block';
    }

    // --- Geolocalização ---
    function handleGeolocation() {
        if (!navigator.geolocation) {
            locationStatus.textContent = 'Geolocalização não suportada pelo seu navegador.';
            showNotification('Seu navegador não suporta a API de Geolocalização.', 'warning');
            return;
        }

        locationStatus.textContent = 'Localizando...';
        getLocationBtn.disabled = true;
        getLocationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            document.getElementById('lat').value = lat;
            document.getElementById('lng').value = lng;
            locationStatus.textContent = `Localização obtida: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
            locationStatus.style.color = '#10b981';

            // Simulação de endereço reverso
            const mockAddress = `Localização Automática (${lat.toFixed(2)}, ${lng.toFixed(2)})`;
            addressInput.value = mockAddress;

            showNotification('Localização obtida com sucesso!', 'success');

            getLocationBtn.disabled = false;
            getLocationBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i>';
        }, (error) => {
            locationStatus.textContent = 'Não foi possível obter sua localização. Preencha manualmente.';
            locationStatus.style.color = '#fbbf24';

            let errorMessage = 'Erro ao obter localização: ';
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage += 'Permissão negada.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage += 'Localização indisponível.';
                    break;
                case error.TIMEOUT:
                    errorMessage += 'Tempo esgotado.';
                    break;
                default:
                    errorMessage += 'Erro desconhecido.';
                    break;
            }

            showNotification(errorMessage, 'error');

            getLocationBtn.disabled = false;
            getLocationBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i>';
        }, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
        });
    }

    // --- Validação em Tempo Real ---
    function setupRealTimeValidation() {
        const fieldsToValidate = [
            'foodName', 'foodType', 'description', 'quantity', 'unit',
            'expiryDate', 'collectionDate', 'cep', 'street', 'number',
            'city', 'state', 'conservation'
        ];

        fieldsToValidate.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field) {
                field.addEventListener('blur', () => validateField(fieldName));
                field.addEventListener('input', () => clearFieldError(fieldName));
            }
        });
    }

    function validateField(fieldName) {
        const field = document.getElementById(fieldName);
        const errorElement = document.getElementById(`error-${fieldName}`);
        const parent = field ? (field.closest('.form-group') || field.closest('.checkbox-item') || field.closest('.terms-group')) : null;

        if (!field || !errorElement || !parent) return;

        errorElement.textContent = '';
        parent.classList.remove('has-error');

        // Validações específicas por campo
        switch (fieldName) {
            case 'quantity':
                if (parseFloat(field.value) <= 0) {
                    setFieldError(fieldName, 'A quantidade deve ser maior que zero.');
                }
                break;

            case 'cep':
                const cepValue = field.value.replace(/\D/g, '');
                if (cepValue.length !== 8) {
                    setFieldError(fieldName, 'CEP deve ter 8 dígitos.');
                }
                break;

            case 'state':
                const stateValue = field.value.trim().toUpperCase();
                if (stateValue.length !== 2) {
                    setFieldError(fieldName, 'Estado deve ter 2 caracteres (UF).');
                }
                break;

            case 'expiryDate':
                if (field.value) {
                    const expiryDate = new Date(field.value + 'T00:00:00');
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    if (expiryDate <= today) {
                        setFieldError(fieldName, 'A data de validade deve ser posterior a hoje.');
                    }
                }
                break;

            case 'collectionDate':
                if (field.value) {
                    const collectionDate = new Date(field.value + 'T00:00:00');
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    if (collectionDate < today) {
                        setFieldError(fieldName, 'A data de coleta não pode ser anterior a hoje.');
                    }
                }
                break;

            case 'terms':
                if (!field.checked) {
                    setFieldError(fieldName, 'Você deve aceitar as Boas Práticas de Segurança Alimentar.');
                }
                break;

            case 'privacyTerms':
                if (!field.checked) {
                    setFieldError(fieldName, 'Você deve aceitar os Termos de Uso e Política de Privacidade.');
                }
                break;

            default:
                if (field.required && !field.value.trim()) {
                    setFieldError(fieldName, 'Este campo é obrigatório.');
                }
                break;
        }
    }

    function setFieldError(fieldName, message) {
        const errorElement = document.getElementById(`error-${fieldName}`);
        const field = document.getElementById(fieldName);
        const parent = field ? (field.closest('.form-group') || field.closest('.checkbox-item') || field.closest('.terms-group')) : null;

        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
        if (parent) {
            parent.classList.add('has-error');
        }
    }

    function clearFieldError(fieldName) {
        const errorElement = document.getElementById(`error-${fieldName}`);
        const field = document.getElementById(fieldName);
        const parent = field ? (field.closest('.form-group') || field.closest('.checkbox-item') || field.closest('.terms-group')) : null;

        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
        if (parent) {
            parent.classList.remove('has-error');
        }
    }

    // --- Validação Completa do Formulário ---
    function validateForm() {
        let isValid = true;

        // Campos obrigatórios do formulário
        const fields = [
            'foodName', 'foodType', 'description', 'quantity', 'unit',
            'expiryDate', 'collectionDate', 'cep', 'street', 'number',
            'city', 'state', 'conservation', 'foodPhoto'
        ];

        // Validar cada campo básico
        fields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (!field) return;

            clearFieldError(fieldName);
            const parent = field.closest('.form-group') || field.closest('.checkbox-item') || field.closest('.terms-group');

            if (field.required) {
                const isEmpty = field.type === 'checkbox' ? !field.checked :
                    field.type === 'file' ? (!field.files || field.files.length === 0) :
                        !field.value.trim();

                if (isEmpty) {
                    setFieldError(fieldName, 'Este campo é obrigatório.');
                    isValid = false;
                }
            }

            // Validações específicas
            if (fieldName === 'quantity' && field.value && parseFloat(field.value) <= 0) {
                setFieldError(fieldName, 'A quantidade deve ser maior que zero.');
                isValid = false;
            }

            if (fieldName === 'cep' && field.value) {
                const cepValue = field.value.replace(/\D/g, '');
                if (cepValue.length !== 8) {
                    setFieldError(fieldName, 'CEP deve ter 8 dígitos.');
                    isValid = false;
                }
            }

            if (fieldName === 'state' && field.value) {
                const stateValue = field.value.trim().toUpperCase();
                if (stateValue.length !== 2) {
                    setFieldError(fieldName, 'Estado deve ter 2 caracteres (UF).');
                    isValid = false;
                }
            }
        });

        // Validar endereço
        const addressField = document.getElementById('address');
        if (addressField && addressField.required && !addressField.value.trim()) {
            setFieldError('address', 'O endereço completo é obrigatório.');
            isValid = false;
        } else {
            clearFieldError('address');
        }

        // Validar termos de segurança alimentar
        if (termsCheckbox && !termsCheckbox.checked) {
            setFieldError('terms', 'Você deve aceitar as Boas Práticas de Segurança Alimentar.');
            isValid = false;
        } else {
            clearFieldError('terms');
        }

        // Validar termos de uso e privacidade (NOVO)
        if (privacyTermsCheckbox && !privacyTermsCheckbox.checked) {
            setFieldError('privacyTerms', 'Você deve aceitar os Termos de Uso e Política de Privacidade.');
            isValid = false;
        } else {
            clearFieldError('privacyTerms');
        }

        // Validação cruzada de datas
        const expiryDate = document.getElementById('expiryDate').value;
        const collectionDate = document.getElementById('collectionDate').value;

        if (expiryDate && collectionDate) {
            const expiry = new Date(expiryDate + 'T00:00:00');
            const collection = new Date(collectionDate + 'T00:00:00');

            if (expiry <= collection) {
                setFieldError('expiryDate', 'A data de validade deve ser posterior à data de coleta.');
                isValid = false;
            }
        }

        // Atualizar progresso para etapa 3 se tudo estiver válido
        if (isValid) {
            updateProgress(3);
        }

        return isValid;
    }

    // --- Carregar Doação para Edição ---
    async function loadDonationForEdit(donationId) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                showNotification('Você precisa estar logado para editar uma doação.', 'error', 5000);
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
                return;
            }

            let currentUser = null;
            if (window.authManager && window.authManager.isAuthenticated()) {
                currentUser = window.authManager.getCurrentUser();
            } else {
                const userData = localStorage.getItem('user');
                if (userData) {
                    currentUser = JSON.parse(userData);
                }
            }

            if (!currentUser || !currentUser.id) {
                showNotification('Erro ao verificar autenticação. Faça login novamente.', 'error', 5000);
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
                return;
            }

            showNotification('Carregando dados da doação...', 'info', 2000);

            const response = await fetch(`/doacoes/${donationId}`);

            if (!response.ok) {
                if (response.status === 404) {
                    showNotification('Doação não encontrada.', 'error', 5000);
                    setTimeout(() => {
                        window.location.href = 'minhas-doacoes.html';
                    }, 2000);
                } else {
                    throw new Error('Erro ao carregar dados da doação');
                }
                return;
            }

            const donation = await response.json();

            // Verificar permissão
            const doadorId = donation.doador ? (donation.doador.id || donation.doador) : null;

            if (!doadorId || doadorId !== currentUser.id) {
                showNotification('Você não tem permissão para editar esta doação.', 'error', 5000);
                setTimeout(() => {
                    window.location.href = 'minhas-doacoes.html';
                }, 3000);
                return;
            }

            // Preencher campos
            populateFormFields(donation);
            showNotification('Dados carregados com sucesso!', 'success', 2000);

            // Atualizar progresso
            updateProgress(3);

        } catch (error) {
            console.error('Erro ao carregar doação:', error);
            showNotification('Erro ao carregar dados da doação. Tente novamente.', 'error', 5000);
        }
    }

    function populateFormFields(donation) {
        // Campos básicos
        if (document.getElementById('foodName')) document.getElementById('foodName').value = donation.titulo || '';
        if (document.getElementById('foodType')) document.getElementById('foodType').value = donation.tipoAlimento || '';
        if (document.getElementById('description')) document.getElementById('description').value = donation.descricao || '';
        if (document.getElementById('quantity')) document.getElementById('quantity').value = donation.quantidade || '';
        if (document.getElementById('unit')) document.getElementById('unit').value = donation.unidade || '';
        if (document.getElementById('conservation')) document.getElementById('conservation').value = donation.conservacao || '';

        // Datas
        if (donation.dataValidade) {
            const dataValidade = new Date(donation.dataValidade);
            const dataValidadeStr = dataValidade.toISOString().split('T')[0];
            if (expiryDateInput) expiryDateInput.value = dataValidadeStr;
        }

        if (donation.dataColeta) {
            const dataColeta = new Date(donation.dataColeta);
            const dataColetaStr = dataColeta.toISOString().split('T')[0];
            if (collectionDateInput) collectionDateInput.value = dataColetaStr;
        }

        // Endereço
        if (donation.cep && cepInput) cepInput.value = donation.cep;
        if (donation.rua && streetInput) streetInput.value = donation.rua;
        if (donation.numero && numberInput) numberInput.value = donation.numero;
        if (donation.cidade && cityInput) cityInput.value = donation.cidade;
        if (donation.estado && stateInput) stateInput.value = donation.estado;
        if (donation.complemento && complementInput) complementInput.value = donation.complemento || '';
        if (donation.endereco && addressInput) addressInput.value = donation.endereco;

        // Coordenadas
        if (donation.latitude && document.getElementById('lat')) {
            document.getElementById('lat').value = donation.latitude;
        }
        if (donation.longitude && document.getElementById('lng')) {
            document.getElementById('lng').value = donation.longitude;
        }

        // Imagem
        if (donation.imagem && photoPreview) {
            photoPreview.src = donation.imagem;
            photoPreview.style.display = 'block';
            photoPreviewContainer.querySelector('i').style.display = 'none';
        }

        // Termos (marcar como aceitos ao editar)
        if (termsCheckbox) termsCheckbox.checked = true;
        if (privacyTermsCheckbox) privacyTermsCheckbox.checked = true;

        // Forçar geração de endereço
        setTimeout(generateFullAddress, 100);
    }

    // --- Submissão do Formulário ---
    async function handleFormSubmit(e) {
        e.preventDefault();

        if (!validateForm()) {
            showNotification('Corrija os erros destacados no formulário.', 'error', 4000);

            // Scroll para o primeiro erro
            const firstError = document.querySelector('.has-error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // Mostrar loading
        btnSubmit.classList.add('loading');
        btnSubmit.disabled = true;
        form.classList.add('form-loading');

        try {
            // 1. Upload da imagem
            let imageUrl = null;
            const photoFile = photoInput.files[0];

            if (photoFile) {
                showNotification('Enviando imagem...', 'info', 2000);

                const imageFormData = new FormData();
                imageFormData.append('image', photoFile);

                if (isEditMode && currentDonationId) {
                    imageFormData.append('doacaoId', currentDonationId);
                }

                const token = localStorage.getItem('token');
                const imageHeaders = {};
                if (token) {
                    imageHeaders['Authorization'] = `Bearer ${token}`;
                }

                const imageResponse = await fetch('/doacoes/upload-image', {
                    method: 'POST',
                    headers: imageHeaders,
                    body: imageFormData
                });

                if (!imageResponse.ok) {
                    throw new Error('Erro ao fazer upload da imagem');
                }

                const imageResult = await imageResponse.json();
                imageUrl = imageResult.imageUrl;
            } else if (isEditMode && photoPreview && photoPreview.src) {
                imageUrl = photoPreview.src;
            }

            // 2. Preparar dados
            const formData = new FormData(form);
            const data = {};

            for (let [key, value] of formData.entries()) {
                if (key === 'quantity') {
                    data[key] = parseFloat(value);
                } else if (key !== 'foodPhoto') {
                    data[key] = value;
                }
            }

            // Incluir aceitação dos termos
            data.termsAccepted = formData.get('terms') === 'on';
            data.privacyTermsAccepted = formData.get('privacyTerms') === 'on';
            data.latitude = formData.get('lat') ? parseFloat(formData.get('lat')) : null;
            data.longitude = formData.get('lng') ? parseFloat(formData.get('lng')) : null;

            // 3. Criar payload
            const payload = {
                titulo: data.foodName,
                descricao: `Tipo: ${data.foodType}. Detalhes: ${data.description}. Conservação: ${data.conservation}. Restrições: ${data.restrictions || 'Nenhuma'}. Medida Caseira: ${data.homeMeasure || 'N/A'}`,
                tipoAlimento: data.foodType,
                quantidade: data.quantity,
                cidade: data.city,
                endereco: data.address,
                latitude: data.latitude,
                longitude: data.longitude,
                dataValidade: data.expiryDate,
                dataColeta: data.collectionDate,
                destino: data.donationTarget,
                unidade: data.unit,
                cep: data.cep,
                rua: data.street,
                numero: data.number,
                estado: data.state,
                complemento: data.complement || '',
                imagem: imageUrl,
                ativo: true,
                termosAceitos: {
                    boasPraticas: data.termsAccepted,
                    termosUso: data.privacyTermsAccepted,
                    dataAceite: new Date().toISOString()
                }
            };

            // 4. Enviar requisição
            showNotification(isEditMode ? 'Salvando alterações...' : 'Salvando doação...', 'info', 2000);
            const token = localStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json'
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const url = isEditMode ? `/doacoes/${currentDonationId}` : '/doacoes';
            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: headers,
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const result = await response.json();
                showNotification(
                    isEditMode ? 'Doação atualizada com sucesso! Redirecionando...' : 'Alimento cadastrado com sucesso! Redirecionando...',
                    'success',
                    3000
                );

                // Notificar sistema de tempo real
                if (!isEditMode) {
                    if (typeof notifyNewDonation === 'function') {
                        notifyNewDonation(result);
                    } else {
                        const newDonationEvent = new CustomEvent('newDonationCreated', {
                            detail: {
                                doacao: result,
                                timestamp: new Date().toISOString()
                            }
                        });
                        window.dispatchEvent(newDonationEvent);
                    }
                }

                setTimeout(() => {
                    window.location.href = 'minhas-doacoes.html';
                }, 2000);
            } else {
                const errorText = await response.text();
                showNotification(
                    isEditMode ? `Erro ao atualizar doação: ${errorText}` : `Erro ao cadastrar alimento: ${errorText}`,
                    'error',
                    5000
                );
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            showNotification('Erro de conexão. Verifique sua internet e tente novamente.', 'error', 5000);
        } finally {
            btnSubmit.classList.remove('loading');
            btnSubmit.disabled = false;
            form.classList.remove('form-loading');
        }
    }

    // Inicializar a aplicação
    init();
});