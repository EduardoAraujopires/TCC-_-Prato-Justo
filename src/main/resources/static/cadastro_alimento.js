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
		setupErrorIcons();
	}

	// --- Configurar ícones de erro nos labels ---
	function setupErrorIcons() {
		// Encontrar todos os labels que contêm asterisco
		const labels = document.querySelectorAll('.form-label');
		labels.forEach(label => {
			const labelText = label.textContent || label.innerText;
			// Se o label contém asterisco, adicionar um span para o indicador obrigatório
			if (labelText.includes('*')) {
				// Verificar se já tem o span required-indicator
				if (!label.querySelector('.required-indicator')) {
					// Substituir o asterisco por um span
					const text = label.innerHTML;
					label.innerHTML = text.replace(/\s*\*\s*/, ' <span class="required-indicator">*</span>');
				}
				
				// Adicionar ícone de erro se ainda não existir (sempre visível)
				if (!label.querySelector('.error-icon')) {
					const fieldId = label.getAttribute('for');
					if (fieldId) {
						const icon = document.createElement('i');
						icon.className = 'fas fa-exclamation-triangle error-icon';
						icon.id = `error-icon-${fieldId}`;
						icon.style.display = 'inline-block'; // Sempre visível
						label.appendChild(icon);
					}
				}
			}
		});
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

		// Geocodificação apenas quando o número for preenchido e perder o foco
		numberInput.addEventListener('blur', () => {
			const street = streetInput.value.trim();
			const number = numberInput.value.trim();
			const city = cityInput.value.trim();
			const state = stateInput.value.trim();
			
			// Só fazer geocodificação se tiver rua, número, cidade e estado
			if (street && number && city && state) {
				geocodeAddressFromFields();
			}
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

			// 1. Buscar endereço via ViaCEP
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

			// Gerar endereço completo
			generateFullAddress();

			// 2. Obter coordenadas via geocodificação (OpenStreetMap)
			await geocodeAddressFromFields();

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

	// Flag para evitar múltiplas chamadas simultâneas
	let geocodingInProgress = false;

	// --- Geocodificação de Endereço (obter coordenadas) ---
	async function geocodeAddressFromFields() {
		// Evitar múltiplas chamadas simultâneas
		if (geocodingInProgress) {
			console.log('⏳ Geocodificação já em andamento, aguardando...');
			return;
		}

		const street = streetInput.value.trim();
		const number = numberInput.value.trim();
		const city = cityInput.value.trim();
		const state = stateInput.value.trim();
		const complement = complementInput.value.trim();
		const cep = cepInput.value.replace(/\D/g, '');

		// Se não tiver informações suficientes, não fazer geocodificação
		if (!city || !state) {
			return;
		}

		geocodingInProgress = true;

		try {
			// Atualizar status para mostrar que está buscando
			if (locationStatus) {
				locationStatus.textContent = 'Obtendo coordenadas...';
				locationStatus.style.color = '#fbbf24';
			}

			// Tentar múltiplas estratégias de geocodificação, PRIORIZANDO ENDEREÇO COMPLETO
			const queries = [];
			
			// ESTRATÉGIA 1 (PRIORIDADE MÁXIMA): Endereço completo com número, rua, cidade, estado
			// Esta é a mais precisa, então tentamos primeiro
			if (street && number && city && state) {
				// Variação 1: Rua, Número, Cidade, Estado, Brasil
				queries.push(`${street}, ${number}, ${city}, ${state}, Brasil`);
				// Variação 2: Rua Número, Cidade, Estado, Brasil (sem vírgula entre rua e número)
				queries.push(`${street} ${number}, ${city}, ${state}, Brasil`);
				// Variação 3: Com CEP no final para maior precisão
				if (cep && cep.length === 8) {
					queries.push(`${street}, ${number}, ${city}, ${state}, ${cep.substring(0, 5)}-${cep.substring(5)}, Brasil`);
					queries.push(`${street} ${number}, ${city}, ${state}, ${cep.substring(0, 5)}-${cep.substring(5)}, Brasil`);
				}
				// Variação 4: Com complemento se disponível
				if (complement) {
					queries.push(`${street}, ${number}, ${complement}, ${city}, ${state}, Brasil`);
				}
			}
			
			// ESTRATÉGIA 2: Endereço com rua mas sem número (menos preciso, mas melhor que só CEP)
			if (street && city && state && !number) {
				queries.push(`${street}, ${city}, ${state}, Brasil`);
				// Com CEP se disponível
				if (cep && cep.length === 8) {
					queries.push(`${street}, ${city}, ${state}, ${cep.substring(0, 5)}-${cep.substring(5)}, Brasil`);
				}
			}
			
			// ESTRATÉGIA 3: CEP formatado (menos preciso, centro do bairro)
			// Usamos apenas se não tivermos rua
			if ((!street || !number) && cep && cep.length === 8) {
				// CEP com formatação
				queries.push(`${cep.substring(0, 5)}-${cep.substring(5)}, ${city}, ${state}, Brasil`);
				// CEP sem formatação
				queries.push(`${cep}, ${city}, ${state}, Brasil`);
			}
			
			// ESTRATÉGIA 4: Apenas cidade e estado (último recurso, muito impreciso)
			if (city && state) {
				queries.push(`${city}, ${state}, Brasil`);
			}

			if (queries.length === 0) {
				if (locationStatus) {
					locationStatus.textContent = 'Informações insuficientes para obter coordenadas.';
					locationStatus.style.color = '#fbbf24';
				}
				return;
			}

			console.log(`🔍 Tentando geocodificar com ${queries.length} estratégias, priorizando endereço completo...`);

			// Verificar se a API key do Google Maps está configurada
			const apiKey = window.GOOGLE_MAPS_API_KEY || '';
			if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
				console.error('❌ Google Maps API Key não configurada. Configure em api-config.js');
				if (locationStatus) {
					locationStatus.textContent = 'API do Google Maps não configurada. Configure a chave em api-config.js';
					locationStatus.style.color = '#ef4444';
				}
				return;
			}

			// Tentar cada query até encontrar coordenadas
			let coordenadas = null;
			let queryUsada = null;
			
			for (const query of queries) {
				console.log('🔍 Tentando geocodificar:', query);
				
				try {
					// Fazer requisição para Google Maps Geocoding API
					const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}&region=br&language=pt-BR`;
					
					const response = await fetch(url);

					if (!response.ok) {
						console.warn('⚠️ Resposta não OK:', response.status);
						continue;
					}

					const data = await response.json();

					// Verificar status da resposta
					if (data.status === 'OK' && data.results && data.results.length > 0) {
						const result = data.results[0];
						const location = result.geometry.location;
						const lat = parseFloat(location.lat);
						const lng = parseFloat(location.lng);
						
						// Verificar se as coordenadas são válidas
						if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
							coordenadas = { lat, lng };
							queryUsada = query;
							
							// Verificar a precisão do resultado baseado no location_type
							const locationType = result.geometry.location_type || '';
							const types = result.types || [];
							
							console.log('✅ Coordenadas obtidas com sucesso:', query, '→', lat, lng);
							console.log(`   Tipo de localização: ${locationType}, Tipos: ${types.join(', ')}`);
							
							// Se encontramos um resultado muito preciso (ROOFTOP, RANGE_INTERPOLATED), 
							// consideramos mais preciso e podemos parar
							if (locationType === 'ROOFTOP' || locationType === 'RANGE_INTERPOLATED') {
								console.log('✅ Resultado muito preciso encontrado, usando estas coordenadas');
								break;
							}
							
							// Se for GEOMETRIC_CENTER ou APPROXIMATE, continuamos tentando outras queries
							// mas guardamos como fallback
							if (locationType === 'GEOMETRIC_CENTER' && queries.indexOf(query) < queries.length - 1) {
								console.log('⚠️ Resultado aproximado, continuando busca por resultado mais preciso...');
								continue;
							}
							
							// Se chegou aqui, temos um resultado razoável
							console.log('✅ Resultado encontrado');
							break;
						}
					} else if (data.status === 'ZERO_RESULTS') {
						console.log('⚠️ Nenhum resultado encontrado para:', query);
						continue;
					} else if (data.status === 'OVER_QUERY_LIMIT') {
						console.error('❌ Limite de requisições excedido na API do Google Maps');
						if (locationStatus) {
							locationStatus.textContent = 'Limite de requisições excedido. Tente novamente mais tarde.';
							locationStatus.style.color = '#ef4444';
						}
						break;
					} else if (data.status === 'REQUEST_DENIED') {
						console.error('❌ Requisição negada. Verifique a API key do Google Maps.');
						if (locationStatus) {
							locationStatus.textContent = 'Erro na configuração da API. Verifique a chave do Google Maps.';
							locationStatus.style.color = '#ef4444';
						}
						break;
					} else {
						console.warn('⚠️ Status da API:', data.status, data.error_message || '');
						continue;
					}
				} catch (error) {
					console.warn('⚠️ Erro ao tentar query:', query, error);
					continue;
				}
				
				// Aguardar um pouco entre tentativas (respeitar rate limit do Google Maps)
				await new Promise(resolve => setTimeout(resolve, 200));
			}

			if (coordenadas) {
				// Preencher campos de coordenadas
				const latInput = document.getElementById('lat');
				const lngInput = document.getElementById('lng');
				
				if (latInput) latInput.value = coordenadas.lat;
				if (lngInput) lngInput.value = coordenadas.lng;
				
				// Atualizar status de localização
				if (locationStatus) {
					const precisao = queryUsada && queryUsada.includes(number) ? 'alta' : 
									queryUsada && queryUsada.includes(street) ? 'média' : 'baixa';
					locationStatus.textContent = `Localização obtida (precisão ${precisao}): ${coordenadas.lat.toFixed(5)}, ${coordenadas.lng.toFixed(5)}`;
					locationStatus.style.color = '#10b981';
				}
				
				showNotification('Coordenadas obtidas com sucesso!', 'success');
			} else {
				if (locationStatus) {
					locationStatus.textContent = 'Coordenadas não encontradas. Verifique se o endereço está correto e tente novamente.';
					locationStatus.style.color = '#fbbf24';
				}
				console.warn('⚠️ Nenhuma coordenada encontrada após todas as tentativas');
			}
		} catch (error) {
			console.error('❌ Erro na geocodificação:', error);
			if (locationStatus) {
				locationStatus.textContent = 'Erro ao obter coordenadas. Tente novamente.';
				locationStatus.style.color = '#ef4444';
			}
		} finally {
			geocodingInProgress = false;
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
			// Não fazer geocodificação automática aqui - apenas quando o número perder o foco
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

	// --- Geolocalização (obter coordenadas do endereço do CEP) ---
	async function handleGeolocation() {
		// Verificar se há CEP ou endereço preenchido
		const cep = cepInput.value.replace(/\D/g, '');
		const street = streetInput.value.trim();
		const city = cityInput.value.trim();
		const state = stateInput.value.trim();

		if (!cep && !street && !city && !state) {
			showNotification('Preencha o CEP ou o endereço primeiro para obter as coordenadas.', 'warning');
			return;
		}

		locationStatus.textContent = 'Obtendo coordenadas do endereço...';
		locationStatus.style.color = '#fbbf24';
		getLocationBtn.disabled = true;
		getLocationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

		try {
			// Usar a função de geocodificação que já existe
			await geocodeAddressFromFields();
			
			// Verificar se as coordenadas foram obtidas
			const latInput = document.getElementById('lat');
			const lngInput = document.getElementById('lng');
			
			if (latInput && lngInput && latInput.value && lngInput.value) {
				const lat = parseFloat(latInput.value);
				const lng = parseFloat(lngInput.value);
				
				locationStatus.textContent = `Localização obtida: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
				locationStatus.style.color = '#10b981';
				
				showNotification('Coordenadas do endereço obtidas com sucesso!', 'success');
			} else {
				locationStatus.textContent = 'Não foi possível obter as coordenadas. Verifique se o endereço está completo.';
				locationStatus.style.color = '#fbbf24';
				showNotification('Não foi possível obter as coordenadas. Verifique o endereço.', 'warning');
			}
		} catch (error) {
			console.error('Erro ao obter coordenadas:', error);
			locationStatus.textContent = 'Erro ao obter coordenadas. Tente novamente.';
			locationStatus.style.color = '#ef4444';
			showNotification('Erro ao obter coordenadas. Tente novamente.', 'error');
		} finally {
			getLocationBtn.disabled = false;
			getLocationBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i>';
		}
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

		// Validação especial para termos
		const termsCheckbox = document.getElementById('terms');
		if (termsCheckbox) {
			termsCheckbox.addEventListener('change', () => clearFieldError('terms'));
		}
	}

	function validateField(fieldName) {
		const field = document.getElementById(fieldName);
		const errorElement = document.getElementById(`error-${fieldName}`);
		const parent = field.closest('.form-group') || field.closest('.terms-group');

		if (!field || !errorElement) return;

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
		const parent = field.closest('.form-group') || field.closest('.terms-group');

		errorElement.textContent = message;
		parent.classList.add('has-error');
		
		// O ícone já está sempre visível, apenas muda de cor quando há erro
		// A classe 'has-error' no parent já faz isso via CSS
	}

	function clearFieldError(fieldName) {
		const errorElement = document.getElementById(`error-${fieldName}`);
		const field = document.getElementById(fieldName);
		const parent = field.closest('.form-group') || field.closest('.terms-group');

		if (errorElement) {
			errorElement.textContent = '';
		}
		if (parent) {
			parent.classList.remove('has-error');
		}
		
		// O ícone permanece visível, apenas volta à cor padrão
		// A remoção da classe 'has-error' já faz isso via CSS
	}

	// --- Validação Completa do Formulário ---
	function validateForm() {
		let isValid = true;
		const fields = [
			'foodName', 'foodType', 'description', 'quantity', 'unit',
			'expiryDate', 'collectionDate', 'cep', 'street', 'number',
			'city', 'state', 'address', 'conservation', 'foodPhoto', 'terms'
		];

		// Validar cada campo
		fields.forEach(fieldName => {
			const field = document.getElementById(fieldName);
			if (!field) return;

			const errorElement = document.getElementById(`error-${fieldName}`);
			const parent = field.closest('.form-group') || field.closest('.terms-group');

			errorElement.textContent = '';
			parent.classList.remove('has-error');

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

			data.termsAccepted = formData.get('terms') === 'on';
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
				ativo: true
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