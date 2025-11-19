// Módulo de cliente API para backend real
const apiClient = {
	// Configuração da API
	baseURL: 'http://localhost:8080/api/chat', // Altere para sua URL
	headers: {
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
	},

	// Buscar histórico de mensagens do backend
	fetchHistory: async (chatId) => {
		try {
			console.log(`[API] Buscando histórico para chat ${chatId}`);

			const response = await fetch(`${apiClient.baseURL}/chats/${chatId}/messages`, {
				method: 'GET',
				headers: apiClient.headers
			});

			if (!response.ok) {
				throw new Error(`Erro ${response.status}: ${response.statusText}`);
			}

			const data = await response.json();
			console.log('[API] Histórico carregado:', data);
			return data.messages || [];

		} catch (error) {
			console.error('[API] Erro ao carregar histórico:', error);

			// Fallback para dados mockados se o backend estiver offline
			return getMockHistory(chatId);
		}
	},

	// Enviar mensagem para o backend
	sendMessage: async (chatId, message) => {
		try {
			console.log(`[API] Enviando mensagem para chat ${chatId}: ${message}`);

			const response = await fetch(`${apiClient.baseURL}/chats/${chatId}/messages`, {
				method: 'POST',
				headers: apiClient.headers,
				body: JSON.stringify({
					text: message,
					sender: 'user'
				})
			});

			if (!response.ok) {
				throw new Error(`Erro ${response.status}: ${response.statusText}`);
			}

			const data = await response.json();
			console.log('[API] Mensagem enviada:', data);
			return data.message;

		} catch (error) {
			console.error('[API] Erro ao enviar mensagem:', error);

			// Fallback local se o backend estiver offline
			return createLocalMessage(message, 'user');
		}
	},

	// Buscar lista de conversas do backend
	fetchChats: async () => {
		try {
			console.log('[API] Buscando lista de conversas');

			const response = await fetch(`${apiClient.baseURL}/chats`, {
				method: 'GET',
				headers: apiClient.headers
			});

			if (!response.ok) {
				throw new Error(`Erro ${response.status}: ${response.statusText}`);
			}

			const data = await response.json();
			console.log('[API] Conversas carregadas:', data);
			return data.chats || [];

		} catch (error) {
			console.error('[API] Erro ao carregar conversas:', error);

			// Fallback para dados mockados
			return getMockChats();
		}
	},

	// Conectar via WebSocket usando SockJS e STOMP para mensagens em tempo real
	connectWS: (onMessage, onStatusChange, currentUserId) => {
		let stompClient = null;
		let reconnectAttempts = 0;
		const maxReconnectAttempts = 5;
		const reconnectDelay = 3000;
		let reconnectTimer = null;
		let userSubscription = null;

		const connect = () => {
			try {
				// Verificar se SockJS e STOMP estão disponíveis
				if (typeof SockJS === 'undefined' || typeof Stomp === 'undefined') {
					console.error('[WebSocket] SockJS ou STOMP não estão carregados');
					if (onStatusChange) onStatusChange('error');
					return;
				}

				// Obter token JWT
				const token = localStorage.getItem('token') || localStorage.getItem('jwtToken');
				if (!token) {
					console.error('[WebSocket] Token JWT não encontrado');
					if (onStatusChange) onStatusChange('error');
					return;
				}

				// Criar conexão SockJS
				const socket = new SockJS('http://localhost:8080/ws-chat');
				stompClient = Stomp.over(socket);

				// Desabilitar logs de debug do STOMP (opcional)
				stompClient.debug = null;

				// Headers com token JWT para autenticação
				const headers = {
					'Authorization': `Bearer ${token}`
				};

				// Conectar ao broker
				stompClient.connect(headers, 
					// Callback de sucesso
					(frame) => {
						console.log('[WebSocket] Conectado com sucesso via STOMP');
						reconnectAttempts = 0;
						if (onStatusChange) onStatusChange('connected');

						// Se temos o ID do usuário atual, inscrever-se no tópico privado
						if (currentUserId) {
							const userTopic = `/user/${currentUserId}/queue/messages`;
							console.log(`[WebSocket] Inscrevendo-se no tópico: ${userTopic}`);
							
							userSubscription = stompClient.subscribe(userTopic, (message) => {
								try {
									const chatMessage = JSON.parse(message.body);
									console.log('[WebSocket] Mensagem recebida:', chatMessage);

									// Determinar se a mensagem foi enviada pelo usuário atual
									const remetenteId = chatMessage.remetenteId;
									const isSent = remetenteId && currentUserId && 
										(parseInt(remetenteId) === parseInt(currentUserId));

									// Converter timestamp de LocalDateTime para ISO string se necessário
									let timestamp = chatMessage.timestamp;
									if (timestamp && typeof timestamp === 'string' && !timestamp.includes('T')) {
										// Se for formato LocalDateTime sem T, adicionar
										timestamp = timestamp.replace(' ', 'T');
									}
									if (!timestamp) {
										timestamp = new Date().toISOString();
									}

									// Transformar para o formato esperado pelo handler
									const formattedMessage = {
										type: 'new_message',
										data: {
											id: chatMessage.id,
											chatId: state.currentChatId || remetenteId,
											text: chatMessage.content || chatMessage.text,
											content: chatMessage.content || chatMessage.text,
											sender: isSent ? 'user' : 'contact',
											timestamp: timestamp,
											status: 'delivered',
											remetenteId: remetenteId,
											remetenteNome: chatMessage.remetenteNome
										}
									};

									console.log('[WebSocket] Mensagem formatada:', formattedMessage);
									if (onMessage) onMessage(formattedMessage);
								} catch (error) {
									console.error('[WebSocket] Erro ao processar mensagem:', error);
									console.error('[WebSocket] Mensagem original:', message.body);
								}
							});
						}
					},
					// Callback de erro
					(error) => {
						console.error('[WebSocket] Erro na conexão:', error);
						if (onStatusChange) onStatusChange('error');

						// Tentar reconectar
						if (reconnectAttempts < maxReconnectAttempts) {
							reconnectTimer = setTimeout(() => {
								reconnectAttempts++;
								console.log(`[WebSocket] Tentativa de reconexão ${reconnectAttempts}`);
								connect();
							}, reconnectDelay);
						} else {
							if (onStatusChange) onStatusChange('disconnected');
						}
					}
				);

			} catch (error) {
				console.error('[WebSocket] Erro na conexão:', error);
				if (onStatusChange) onStatusChange('error');
			}
		};

		// Iniciar conexão
		connect();

		// Retornar objeto com controle do WebSocket
		return {
			disconnect: () => {
				if (userSubscription) {
					userSubscription.unsubscribe();
					userSubscription = null;
				}
				if (stompClient && stompClient.connected) {
					stompClient.disconnect();
					stompClient = null;
				}
				if (reconnectTimer) {
					clearTimeout(reconnectTimer);
					reconnectTimer = null;
				}
			},
			reconnect: () => {
				if (stompClient && stompClient.connected) {
					stompClient.disconnect();
				}
				if (reconnectTimer) {
					clearTimeout(reconnectTimer);
				}
				reconnectAttempts = 0;
				connect();
			},
			send: (message, destinatarioId) => {
				if (stompClient && stompClient.connected) {
					if (!destinatarioId) {
						console.error('[WebSocket] Destinatário não especificado');
						return false;
					}

					// Enviar mensagem para o destino /app/chat.sendMessage
					const chatMessage = {
						destinatarioId: destinatarioId,
						content: message.content || message.text || message.message,
						type: message.type || 'CHAT'
					};
					
					stompClient.send('/app/chat.sendMessage', {}, JSON.stringify(chatMessage));
					return true;
				}
				console.warn('[WebSocket] Tentativa de enviar mensagem sem conexão');
				return false;
			},
			getStatus: () => {
				if (!stompClient) return 'disconnected';
				if (stompClient.connected) return 'connected';
				return 'disconnected';
			}
		};
	},

	// Marcar mensagens como lidas
	markAsRead: async (chatId, messageIds) => {
		try {
			const response = await fetch(`${apiClient.baseURL}/chats/${chatId}/read`, {
				method: 'POST',
				headers: apiClient.headers,
				body: JSON.stringify({ messageIds })
			});

			if (!response.ok) {
				throw new Error(`Erro ${response.status}: ${response.statusText}`);
			}

			console.log('[API] Mensagens marcadas como lidas');
		} catch (error) {
			console.error('[API] Erro ao marcar mensagens como lidas:', error);
		}
	},

	// Buscar informações do usuário/contato
	fetchUserInfo: async (userId) => {
		try {
			const response = await fetch(`${apiClient.baseURL}/users/${userId}`, {
				method: 'GET',
				headers: apiClient.headers
			});

			if (!response.ok) {
				throw new Error(`Erro ${response.status}: ${response.statusText}`);
			}

			const data = await response.json();
			return data.user;
		} catch (error) {
			console.error('[API] Erro ao buscar informações do usuário:', error);
			return null;
		}
	}
};

// Funções auxiliares para fallback
function getMockHistory(chatId) {
	const mockHistories = {
		1: [
			{
				id: 1,
				text: "Olá! Gostaria de saber mais sobre as doações de hoje.",
				sender: "user",
				timestamp: new Date(Date.now() - 3600000).toISOString(),
				status: "delivered"
			},
			{
				id: 2,
				text: "Oi! Temos várias opções disponíveis hoje. Pão integral, frutas da estação e legumes orgânicos.",
				sender: "contact",
				timestamp: new Date(Date.now() - 3500000).toISOString(),
				status: "read"
			},
			{
				id: 3,
				text: "Que ótimo! Posso reservar alguns pães e legumes?",
				sender: "user",
				timestamp: new Date(Date.now() - 3400000).toISOString(),
				status: "delivered"
			},
			{
				id: 4,
				text: "Claro! Pode vir buscar entre 14h e 18h. Temos bastante disponibilidade hoje.",
				sender: "contact",
				timestamp: new Date(Date.now() - 3300000).toISOString(),
				status: "read"
			},
			{
				id: 5,
				text: "Perfeito! Muito obrigado pela iniciativa 😊",
				sender: "user",
				timestamp: new Date(Date.now() - 3200000).toISOString(),
				status: "read"
			}
		],
		2: [
			{
				id: 1,
				text: "Precisamos de voluntários para sábado",
				sender: "contact",
				timestamp: new Date(Date.now() - 86400000).toISOString(),
				status: "read"
			},
			{
				id: 2,
				text: "Posso ajudar! Que horas?",
				sender: "user",
				timestamp: new Date(Date.now() - 86000000).toISOString(),
				status: "delivered"
			}
		]
	};

	return mockHistories[chatId] || [];
}

function getMockChats() {
	return [
		{
			id: 1,
			name: "Restaurante Jardim",
			avatar: "RJ",
			lastMessage: "Temos pães e legumes disponíveis hoje",
			timestamp: new Date(Date.now() - 3000000).toISOString(),
			unread: 0,
			type: "restaurant",
			online: true
		},
		{
			id: 2,
			name: "ONG Comida Para Todos",
			avatar: "CT",
			lastMessage: "Precisamos de voluntários para sábado",
			timestamp: new Date(Date.now() - 86400000).toISOString(),
			unread: 2,
			type: "ong",
			online: false
		},
		{
			id: 3,
			name: "Mercado Saúde",
			avatar: "MS",
			lastMessage: "As frutas chegaram, venham buscar!",
			timestamp: new Date(Date.now() - 172800000).toISOString(),
			unread: 0,
			type: "market",
			online: true
		},
		{
			id: 4,
			name: "Ana Silva",
			avatar: "AS",
			lastMessage: "Obrigada pelas doações da semana passada!",
			timestamp: new Date(Date.now() - 259200000).toISOString(),
			unread: 0,
			type: "user",
			online: true
		}
	];
}

function createLocalMessage(text, sender) {
	return {
		id: 'local-' + Date.now(),
		text: text,
		sender: sender,
		timestamp: new Date().toISOString(),
		status: 'sent'
	};
}

// Estado da aplicação
const state = {
	currentChatId: null,
	currentChatUserId: null, // ID do usuário com quem está conversando
	messages: [],
	chats: [],
	isTyping: false,
	isOnline: true,
	theme: 'light',
	wsConnection: null,
	currentUser: null,
	currentUserId: null, // ID do usuário atual logado
	pollingInterval: null, // Intervalo de polling para verificar novas mensagens
	lastMessageTimestamp: null // Timestamp da última mensagem recebida
};

// Elementos DOM
const elements = {
	sidebar: document.getElementById('sidebar'),
	chatsList: document.getElementById('chatsList'),
	messagesContainer: document.getElementById('messagesContainer'),
	messageInput: document.getElementById('messageInput'),
	sendBtn: document.getElementById('sendBtn'),
	emojiBtn: document.getElementById('emojiBtn'),
	emojiPicker: document.getElementById('emojiPicker'),
	emojiGrid: document.getElementById('emojiGrid'),
	contactName: document.getElementById('contactName'),
	contactAvatar: document.getElementById('contactAvatar'),
	contactStatus: document.getElementById('contactStatus'),
	typingIndicator: document.getElementById('typingIndicator'),
	connectionStatus: document.getElementById('connectionStatus'),
	themeToggle: document.getElementById('themeToggle'),
	menuToggle: document.getElementById('menuToggle')
};

// Lista de emojis populares
const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'];

// Inicialização - apenas se os elementos existirem
document.addEventListener('DOMContentLoaded', async () => {
	// Verificar se os elementos do chat existem antes de inicializar
	const sidebar = document.getElementById('sidebar');
	const chatsList = document.getElementById('chatsList');
	
	// Só inicializar automaticamente se os elementos estiverem disponíveis
	// Caso contrário, deixar para inicialização manual
	if (sidebar && chatsList) {
		try {
			console.log('[Chat] Elementos encontrados, inicializando...');
			await initializeApp();
		} catch (error) {
			console.error('[Chat] Erro na inicialização automática:', error);
			// Tentar novamente após um pequeno delay
			setTimeout(async () => {
				try {
					await initializeApp();
				} catch (retryError) {
					console.error('[Chat] Erro na segunda tentativa de inicialização:', retryError);
				}
			}, 500);
		}
	} else {
		console.warn('[Chat] Elementos não encontrados, tentando novamente em 500ms...');
		// Tentar novamente após um pequeno delay
		setTimeout(async () => {
			const retrySidebar = document.getElementById('sidebar');
			const retryChatsList = document.getElementById('chatsList');
			if (retrySidebar && retryChatsList) {
				try {
					await initializeApp();
				} catch (error) {
					console.error('[Chat] Erro na inicialização após retry:', error);
				}
			} else {
				console.error('[Chat] Elementos ainda não encontrados após retry');
			}
		}, 500);
	}
});

async function initializeApp() {
	console.log('[App] Iniciando aplicação...');
	
	// Carregar configurações do usuário
	await loadUserSettings();

	// Verificar se há parâmetros na URL (userId ou requestId) - mas não mudar a URL
	const urlParams = new URLSearchParams(window.location.search);
	const userId = urlParams.get('userId');
	const requestId = urlParams.get('requestId');

	// Limpar parâmetros da URL sem recarregar a página
	if (userId || requestId) {
		window.history.replaceState({}, document.title, window.location.pathname);
	}

	// Carregar lista de conversas primeiro (sempre)
	console.log('[App] Carregando lista de chats...');
	await loadChats();
	console.log('[App] Lista de chats carregada. Total:', state.chats.length);
	
	// Se houver userId na URL, carregar conversa com esse usuário
	if (userId) {
		console.log('[App] Carregando chat com usuário:', userId);
		await loadChatWithUser(userId, requestId);
	}

	// Conectar WebSocket (após carregar usuário)
	if (state.currentUserId) {
		connectWebSocket();
		// Iniciar polling como fallback
		startPolling();
	}

	// Configurar event listeners
	setupEventListeners();

	// Não carregar primeira conversa automaticamente - deixar usuário escolher
	// Mostrar estado vazio se não houver conversas
	if (!userId) {
		if (state.chats.length === 0) {
			showEmptyChatState();
		} else {
			hideEmptyChatState();
		}
	}

	console.log('[App] Aplicação inicializada com sucesso');
}

async function loadUserSettings() {
	// Carregar tema salvo
	const savedTheme = localStorage.getItem('pratoJustoTheme');
	if (savedTheme) {
		setTheme(savedTheme);
	}

	// Carregar token de autenticação
	const token = localStorage.getItem('token') || localStorage.getItem('jwtToken');
	if (!token) {
		console.log('[Auth] Usuário não autenticado');
		// Redirecionar para login se não houver token
		window.location.href = 'login.html';
		return;
	}

	// Atualizar headers da API com o token
	apiClient.headers.Authorization = `Bearer ${token}`;

	// Buscar informações do usuário atual
	try {
		const response = await fetch('http://localhost:8080/api/user/me', {
			headers: {
				'Authorization': `Bearer ${token}`
			}
		});

		if (response.ok) {
			const userData = await response.json();
			state.currentUser = userData;
			state.currentUserId = userData.id;
			console.log('[Auth] Usuário carregado:', userData);
		} else {
			console.error('[Auth] Erro ao carregar usuário');
			localStorage.removeItem('token');
			localStorage.removeItem('jwtToken');
			window.location.href = 'login.html';
		}
	} catch (error) {
		console.error('[Auth] Erro ao buscar usuário:', error);
	}
}

// Função auxiliar para buscar informações do usuário e última mensagem
async function buildChatFromUser(userId, token, defaultName = 'Usuário', metadata = {}) {
	try {
		const userResponse = await fetch(`http://localhost:8080/api/user/${userId}`, {
			headers: {
				'Authorization': `Bearer ${token}`
			}
		});
		
		if (!userResponse.ok) {
			return null;
		}
		
		const userInfo = await userResponse.json();
		let lastMessage = '';
		let lastTimestamp = new Date().toISOString();
		
		// Buscar última mensagem
		try {
			const messagesResponse = await fetch(`http://localhost:8080/api/chat/conversations/${userId}`, {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});
			if (messagesResponse.ok) {
				const messages = await messagesResponse.json();
				if (messages && messages.length > 0) {
					const lastMsg = messages[messages.length - 1];
					lastMessage = lastMsg.conteudo || lastMsg.content || '';
					lastTimestamp = lastMsg.criadoEm || lastMsg.timestamp || lastTimestamp;
				}
			}
		} catch (e) {
			console.error('[App] Erro ao buscar última mensagem:', e);
		}
		
		const userName = userInfo.nome || userInfo.name || defaultName;
		const hasMessages = lastMessage && lastMessage.trim() !== '';
		
		// Se tem mensagens, sempre considerar ativo (histórico de conversa)
		// Se é uma solicitação aceita (em_andamento), sempre considerar ativo
		// Caso contrário, usar o isActive dos metadados
		const isSolicitacaoAceita = metadata.solicitacaoStatus === 'em_andamento';
		const isActive = hasMessages || isSolicitacaoAceita || (metadata.isActive !== false);
		
		return {
			id: userInfo.id,
			name: userName,
			avatar: userName.substring(0, 2).toUpperCase(),
			lastMessage: lastMessage || metadata.defaultMessage || '',
			timestamp: lastTimestamp,
			unread: 0,
			type: 'user',
			online: true,
			userId: userInfo.id,
			isActive: isActive,
			...metadata // Incluir metadados (doacaoId, solicitacaoId, status, etc)
		};
	} catch (error) {
		console.error(`[App] Erro ao buscar informações do usuário ${userId}:`, error);
		return null;
	}
}

async function loadChats() {
	console.log('[App] loadChats() chamado');
	try {
		const token = localStorage.getItem('token') || localStorage.getItem('jwtToken');
		if (!token) {
			console.warn('[App] Token não encontrado');
			state.chats = [];
			renderChatList();
			return;
		}

		console.log('[App] Token encontrado, buscando chats com tokens...');
		
		// Buscar chats usando a nova API que retorna chats com tokens
		const chatsResponse = await fetch('http://localhost:8080/api/chat/chats', {
			headers: {
				'Authorization': `Bearer ${token}`
			}
		});
		
		if (!chatsResponse.ok) {
			console.error('[App] Erro ao buscar chats:', chatsResponse.status);
			state.chats = [];
			renderChatList();
			return;
		}
		
		const chatsData = await chatsResponse.json();
		console.log('[App] Chats recebidos da API:', chatsData.length);
		
		// Transformar os dados da API no formato esperado pelo frontend
		state.chats = chatsData.map(chatData => {
			const outroParticipante = chatData.outroParticipante;
			const ultimaMensagem = chatData.ultimaMensagem;
			const solicitacao = chatData.solicitacao;
			
			// Determinar timestamp (última mensagem ou criação do chat)
			let timestamp = new Date().toISOString();
			if (ultimaMensagem && ultimaMensagem.criadoEm) {
				timestamp = ultimaMensagem.criadoEm;
			} else if (chatData.criadoEm) {
				timestamp = chatData.criadoEm;
			}
			
			// Determinar última mensagem para preview
			let lastMessage = '';
			if (ultimaMensagem && ultimaMensagem.conteudo) {
				lastMessage = ultimaMensagem.conteudo;
			} else if (solicitacao && solicitacao.doacaoTitulo) {
				lastMessage = `Doação: ${solicitacao.doacaoTitulo}`;
			}
			
			// Nome do outro participante
			const nome = outroParticipante.nome || 'Usuário';
			const avatar = nome.substring(0, 2).toUpperCase();
			
			return {
				id: outroParticipante.id,
				chatId: chatData.id, // ID do chat no banco
				token: chatData.token, // Token do chat
				name: nome,
				avatar: avatar,
				avatarUrl: outroParticipante.avatarUrl || null, // URL do avatar
				lastMessage: lastMessage,
				timestamp: timestamp,
				unread: 0,
				type: 'user',
				online: true,
				userId: outroParticipante.id,
				isActive: chatData.ativo !== false, // Chats ativos sempre aparecem
				solicitacaoStatus: solicitacao ? solicitacao.status : null,
				solicitacaoId: solicitacao ? solicitacao.id : null
			};
		});
		
		// Ordenar por timestamp (mais recentes primeiro)
		state.chats.sort((a, b) => {
			return new Date(b.timestamp) - new Date(a.timestamp);
		});
		
		console.log('[App] Total de chats carregados:', state.chats.length);
		console.log('[App] Chats detalhados:', state.chats.map(c => ({
			id: c.id,
			name: c.name,
			token: c.token,
			status: c.solicitacaoStatus,
			isActive: c.isActive,
			hasMessages: !!(c.lastMessage && c.lastMessage.trim() !== '')
		})));
		renderChatList();
	} catch (error) {
		console.error('[App] Erro ao carregar conversas:', error);
		showError('Erro ao carregar conversas');
		state.chats = [];
		renderChatList();
	}
}

// Função para carregar chat com um usuário específico
async function loadChatWithUser(userId, requestId) {
	try {
		const token = localStorage.getItem('token') || localStorage.getItem('jwtToken');
		if (!token) {
			console.error('[App] Token não encontrado');
			return;
		}

		// Primeiro, tentar buscar informações do localStorage (se vier de aceitar solicitação)
		let user = null;
		const savedUserInfo = localStorage.getItem('chatUserInfo');
		if (savedUserInfo) {
			try {
				const parsed = JSON.parse(savedUserInfo);
				if (parsed.id == userId) {
					user = parsed;
					localStorage.removeItem('chatUserInfo'); // Limpar após usar
				}
			} catch (e) {
				console.error('[App] Erro ao parsear chatUserInfo:', e);
			}
		}

		// Se não encontrou no localStorage, buscar informações do usuário do banco
		if (!user) {
			try {
				const userResponse = await fetch(`http://localhost:8080/api/user/${userId}`, {
					headers: {
						'Authorization': `Bearer ${token}`
					}
				});

				if (userResponse.ok) {
					user = await userResponse.json();
				} else {
					console.error(`[App] Erro ao buscar usuário: ${userResponse.status}`);
				}
			} catch (error) {
				console.error(`[App] Erro ao buscar usuário:`, error);
			}
		}

		if (!user) {
			// Se não conseguir buscar, mostrar erro
			showError('Não foi possível carregar informações do usuário');
			return;
		}

		await setupChatWithUser(user, userId, requestId);
	} catch (error) {
		console.error('[App] Erro ao carregar chat com usuário:', error);
		showError('Erro ao carregar conversa');
	}
}

// Função para configurar chat com um usuário específico
async function setupChatWithUser(user, userId, requestId) {
	// Garantir que userId é um número
	const otherUserId = parseInt(userId);
	if (isNaN(otherUserId)) {
		console.error('[App] ID de usuário inválido:', userId);
		return;
	}

	// Criar ou encontrar chat com esse usuário
	const userName = user.nome || user.name || 'Usuário';
	const userAvatar = userName.substring(0, 2).toUpperCase();
	
	// Verificar se já existe um chat com esse usuário
	let chat = state.chats.find(c => c.userId === otherUserId || (c.id && parseInt(c.id) === otherUserId));
	
	if (!chat) {
		// Criar novo chat
		chat = {
			id: otherUserId,
			name: userName,
			avatar: userAvatar,
			lastMessage: '',
			timestamp: new Date().toISOString(),
			unread: 0,
			type: 'user',
			online: true,
			userId: otherUserId
		};
		state.chats.push(chat);
		renderChatList();
	}

	// Atualizar informações do contato no header
	if (elements.contactName) {
		elements.contactName.textContent = userName;
	}
	if (elements.contactAvatar) {
		elements.contactAvatar.textContent = userAvatar;
		elements.contactAvatar.style.display = 'flex';
	}
	if (elements.contactStatus) {
		updateContactStatus('online');
		const statusSpan = elements.contactStatus.querySelector('span');
		if (statusSpan) {
			statusSpan.style.display = 'inline';
		}
	}

	// Mostrar ações do chat
	const chatActions = document.getElementById('chatActions');
	if (chatActions) {
		chatActions.style.display = 'flex';
	}

	// Esconder sidebar em mobile e mostrar área de chat
	if (elements.sidebar && window.innerWidth < 769) {
		elements.sidebar.classList.remove('active');
	}
	const chatArea = document.querySelector('.chat-area');
	if (chatArea) {
		chatArea.classList.add('active');
	}

	// Esconder estado vazio
	hideEmptyChatState();

	// Carregar histórico de mensagens
	await loadChatHistory(otherUserId);

	// Definir chat atual - usar ID do usuário
	state.currentChatId = otherUserId;
	state.currentChatUserId = otherUserId;
	state.lastMessageTimestamp = null; // Resetar timestamp ao abrir novo chat
	
	// Reiniciar polling para o novo chat
	if (state.currentUserId) {
		startPolling();
	}
}

// Função para carregar histórico de mensagens com um usuário
async function loadChatHistory(otherUserId) {
	try {
		const token = localStorage.getItem('token') || localStorage.getItem('jwtToken');
		if (!token) {
			console.error('[App] Token não encontrado');
			return;
		}

		// Limpar área de mensagens
		if (elements.messagesContainer) {
			elements.messagesContainer.innerHTML = '';
		}

		// Buscar histórico de mensagens
		const response = await fetch(`http://localhost:8080/api/chat/conversations/${otherUserId}`, {
			headers: {
				'Authorization': `Bearer ${token}`
			}
		});

		if (response.ok) {
			const messages = await response.json();
			
			// Buscar informações do usuário atual para comparar
			const token = localStorage.getItem('token') || localStorage.getItem('jwtToken');
			let currentUserId = null;
			if (token) {
				try {
					const meResponse = await fetch('http://localhost:8080/api/user/me', {
						headers: {
							'Authorization': `Bearer ${token}`
						}
					});
					if (meResponse.ok) {
						const me = await meResponse.json();
						currentUserId = me.id;
					}
				} catch (error) {
					console.error('[App] Erro ao buscar usuário atual:', error);
				}
			}

			// Converter mensagens para o formato esperado
			state.messages = messages.map(msg => {
				// Determinar se a mensagem foi enviada pelo usuário atual
				const remetenteId = msg.remetente ? (msg.remetente.id || msg.remetente.id_usuario) : null;
				const isSent = remetenteId && (
					remetenteId === currentUserId ||
					remetenteId === parseInt(currentUserId) ||
					parseInt(remetenteId) === parseInt(currentUserId)
				);
				
				return {
					id: msg.id || msg.id_mensagem,
					text: msg.conteudo || msg.content,
					sender: isSent ? 'user' : 'contact',
					timestamp: msg.criadoEm || msg.timestamp || new Date().toISOString(),
					status: msg.lido ? 'read' : 'delivered'
				};
			});

			// Renderizar mensagens
			renderMessages();
			scrollToBottom();
		} else {
			// Se não houver mensagens, mostrar área vazia
			state.messages = [];
			renderMessages();
		}
	} catch (error) {
		console.error('[App] Erro ao carregar histórico:', error);
		state.messages = [];
		renderMessages();
	}
}

function renderChatList() {
	console.log('[App] renderChatList() chamado. Total de chats:', state.chats.length);
	
	if (!elements.chatsList) {
		console.error('[App] Elemento chatsList não encontrado');
		return;
	}
	
	elements.chatsList.innerHTML = '';

	if (state.chats.length === 0) {
		console.log('[App] Nenhum chat encontrado, mostrando estado vazio');
		elements.chatsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comments" style="font-size: 3rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                <p style="color: var(--text-light); text-align: center;">Nenhuma conversa encontrada</p>
            </div>
        `;
		return;
	}
	
	console.log('[App] Renderizando', state.chats.length, 'chats');

	state.chats.forEach(chat => {
		const chatElement = document.createElement('div');
		
		// Chats com token sempre aparecem (são criados quando solicitação é aceita)
		// Apenas marcar como inativo se explicitamente desativado
		const isInactive = chat.isActive === false;
		const statusClass = isInactive ? 'inactive' : '';
		
		chatElement.className = `chat-item ${chat.id === state.currentChatId ? 'active' : ''} ${chat.unread > 0 ? 'unread' : ''} ${statusClass}`;
		chatElement.setAttribute('role', 'button');
		chatElement.setAttribute('tabindex', '0');
		chatElement.setAttribute('aria-label', `Conversa com ${chat.name}. ${chat.lastMessage}`);

		const time = formatTime(chat.timestamp);
		const unreadBadge = chat.unread > 0 ? `<span class="unread-badge">${chat.unread}</span>` : '';
		const onlineIndicator = chat.online && !isInactive ? '<span class="online-dot"></span>' : '';
		
		// Badge de status para chats cancelados ou concluídos (mesmo que tenham mensagens)
		let statusBadge = '';
		if (chat.solicitacaoStatus) {
			if (chat.solicitacaoStatus === 'cancelada') {
				statusBadge = '<span class="status-badge canceled" title="Solicitação cancelada">Cancelada</span>';
			} else if (chat.solicitacaoStatus === 'concluida') {
				statusBadge = '<span class="status-badge completed" title="Solicitação concluída">Concluída</span>';
			}
		}

		// Buscar avatar do usuário
		const avatarUrl = chat.avatarUrl || null;
		const avatarHTML = avatarUrl 
			? `<img src="http://localhost:8080${avatarUrl}" alt="${chat.name}" onerror="this.parentElement.innerHTML='${chat.avatar}'">`
			: chat.avatar;
		
		chatElement.innerHTML = `
            <div class="chat-avatar">${avatarHTML}</div>
            <div class="chat-info">
                <div class="chat-info-header">
                    <div class="chat-name">${chat.name} ${unreadBadge} ${statusBadge}</div>
                    <div class="chat-time">${time}</div>
                </div>
                <div class="chat-preview">${chat.lastMessage} ${onlineIndicator}</div>
            </div>
        `;

		chatElement.addEventListener('click', () => {
			loadChat(chat.id);
			if (window.innerWidth < 769) {
				elements.sidebar.classList.remove('active');
			}
		});

		// Suporte a teclado para acessibilidade
		chatElement.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				loadChat(chat.id);
				if (window.innerWidth < 769) {
					elements.sidebar.classList.remove('active');
				}
			}
		});

		elements.chatsList.appendChild(chatElement);
	});
}

async function loadChat(chatId) {
	// Converter para número se necessário
	const chatUserId = typeof chatId === 'string' ? parseInt(chatId) : chatId;
	
	if (state.currentChatId === chatUserId) {
		console.log('[App] Chat já está carregado, recarregando mensagens do banco...');
		// Recarregar mensagens do banco mesmo se já estiver no chat
		await loadChatHistory(chatUserId);
		return;
	}

	state.currentChatId = chatUserId;
	state.currentChatUserId = chatUserId;
	state.messages = [];
	state.lastMessageTimestamp = null; // Resetar timestamp ao trocar de chat

	// Atualizar informações do contato
	const chat = state.chats.find(c => (c.id && parseInt(c.id) === chatUserId) || c.userId === chatUserId);
	if (chat) {
		elements.contactName.textContent = chat.name;
		
		// Atualizar avatar com foto se disponível
		if (chat.avatarUrl) {
			elements.contactAvatar.innerHTML = `<img src="http://localhost:8080${chat.avatarUrl}" alt="${chat.name}" onerror="this.parentElement.textContent='${chat.avatar}'">`;
		} else {
			elements.contactAvatar.textContent = chat.avatar;
		}
		elements.contactAvatar.style.display = 'flex';
		updateContactStatus(chat.online ? 'online' : 'offline');
		const statusSpan = elements.contactStatus.querySelector('span');
		if (statusSpan) {
			statusSpan.style.display = 'inline';
		}

		// Atualizar lista de conversas para destacar a ativa
		document.querySelectorAll('.chat-item').forEach(item => {
			item.classList.remove('active');
		});
		const chatIndex = state.chats.findIndex(c => (c.id && parseInt(c.id) === chatUserId) || c.userId === chatUserId);
		if (chatIndex !== -1) {
			const chatItems = document.querySelectorAll('.chat-item');
			if (chatItems[chatIndex]) {
				chatItems[chatIndex].classList.add('active');
			}
		}

		// Marcar mensagens como lidas
		if (chat.unread > 0) {
			await apiClient.markAsRead(chatUserId, []);
			// Atualizar estado local
			chat.unread = 0;
			renderChatList();
		}
	}

	// Esconder estado vazio
	hideEmptyChatState();

	// Limpar área de mensagens
	const existingMessages = elements.messagesContainer.querySelectorAll('.message, .empty-chat-state');
	existingMessages.forEach(msg => msg.remove());
	
	// Recriar typing indicator se não existir
	if (!elements.messagesContainer.querySelector('#typingIndicator')) {
		elements.typingIndicator = document.createElement('div');
		elements.typingIndicator.className = 'typing-indicator';
		elements.typingIndicator.id = 'typingIndicator';
		elements.typingIndicator.style.display = 'none';
		elements.typingIndicator.innerHTML = `
			<div class="typing-dots">
				<span></span>
				<span></span>
				<span></span>
			</div>
		`;
		elements.messagesContainer.appendChild(elements.typingIndicator);
	}

	// Mostrar indicador de carregamento
	const loadingMessage = document.createElement('div');
	loadingMessage.className = 'message received loading';
	loadingMessage.innerHTML = `
        <div class="loading-dots">
            <span></span>
            <span></span>
            <span></span>
        </div>
        <div class="message-time">Carregando...</div>
    `;
	elements.messagesContainer.appendChild(loadingMessage);

	try {
		// Carregar histórico de mensagens usando API REST
		const token = localStorage.getItem('token') || localStorage.getItem('jwtToken');
		if (token) {
			const response = await fetch(`http://localhost:8080/api/chat/conversations/${chatUserId}`, {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});

			if (response.ok) {
				const messages = await response.json();
				console.log('[App] Mensagens carregadas do banco:', messages.length);
				
				// Buscar informações do usuário atual para comparar
				let currentUserId = state.currentUserId;
				if (!currentUserId && state.currentUser) {
					currentUserId = state.currentUser.id;
				}
				
				if (!currentUserId) {
					// Tentar buscar do token
					try {
						const meResponse = await fetch('http://localhost:8080/api/user/me', {
							headers: {
								'Authorization': `Bearer ${token}`
							}
						});
						if (meResponse.ok) {
							const me = await meResponse.json();
							currentUserId = me.id;
							state.currentUserId = me.id;
						}
					} catch (e) {
						console.error('[App] Erro ao buscar usuário atual:', e);
					}
				}

				// Converter mensagens para o formato esperado
				state.messages = messages.map(msg => {
					// Determinar se a mensagem foi enviada pelo usuário atual
					const remetenteId = msg.remetente ? (msg.remetente.id || msg.remetente.id_usuario) : null;
					const isSent = remetenteId && currentUserId && (
						parseInt(remetenteId) === parseInt(currentUserId)
					);
					
					// Converter timestamp de LocalDateTime para ISO string se necessário
					let timestamp = msg.criadoEm || msg.criado_em || msg.timestamp;
					if (timestamp && typeof timestamp === 'string' && !timestamp.includes('T')) {
						timestamp = timestamp.replace(' ', 'T');
					}
					if (!timestamp) {
						timestamp = new Date().toISOString();
					}
					
					const messageObj = {
						id: msg.id || msg.id_mensagem,
						text: msg.conteudo || msg.content || '',
						sender: isSent ? 'user' : 'contact',
						timestamp: timestamp,
						status: msg.lido ? 'read' : 'delivered'
					};
					
					console.log('[App] Mensagem convertida:', messageObj);
					return messageObj;
				});

				// Remover mensagem de carregamento
				loadingMessage.remove();

				console.log('[App] Total de mensagens no estado:', state.messages.length);
				
				// Atualizar timestamp da última mensagem para polling
				if (state.messages.length > 0) {
					const lastMsg = state.messages[state.messages.length - 1];
					state.lastMessageTimestamp = lastMsg.timestamp;
				}
				
				renderMessages();
				scrollToBottom();
				
				// Iniciar polling para verificar novas mensagens
				if (state.currentUserId && state.currentChatUserId) {
					startPolling();
				}
				
				return;
			} else {
				console.error('[App] Erro ao carregar mensagens:', response.status, response.statusText);
			}
		}

		// Fallback: usar API client
		const messages = await apiClient.fetchHistory(chatUserId);
		state.messages = messages;

		// Remover mensagem de carregamento
		loadingMessage.remove();

		renderMessages();
		scrollToBottom();

	} catch (error) {
		console.error('[App] Erro ao carregar chat:', error);
		loadingMessage.innerHTML = `
            <div class="message-text">Erro ao carregar mensagens</div>
            <div class="message-time">Tente novamente</div>
        `;
		loadingMessage.classList.remove('loading');
	}
}

function renderMessages() {
	if (!elements.messagesContainer) {
		console.error('[App] Container de mensagens não encontrado');
		return;
	}

	// Esconder estado vazio
	hideEmptyChatState();

	// Limpar mensagens existentes (exceto o indicador de digitação e estado vazio)
	const existingMessages = elements.messagesContainer.querySelectorAll('.message');
	existingMessages.forEach(msg => {
		if (!msg.classList.contains('typing-indicator') && !msg.classList.contains('empty-chat-state')) {
			msg.remove();
		}
	});

	// Se não houver mensagens, mostrar estado vazio
	if (!state.messages || state.messages.length === 0) {
		showEmptyChatState('Nenhuma mensagem ainda. Comece a conversa!');
		return;
	}

	// Adicionar mensagens ao container
	console.log('[App] Renderizando', state.messages.length, 'mensagens');
	state.messages.forEach((message, index) => {
		if (!message || !message.text) {
			console.warn('[App] Mensagem inválida ignorada:', message);
			return;
		}
		
		const messageElement = createMessageElement(message);
		if (messageElement) {
			const typingIndicator = elements.messagesContainer.querySelector('#typingIndicator');
			if (typingIndicator) {
				elements.messagesContainer.insertBefore(messageElement, typingIndicator);
			} else {
				elements.messagesContainer.appendChild(messageElement);
			}
			console.log(`[App] Mensagem ${index + 1} renderizada:`, message.text.substring(0, 50));
		} else {
			console.warn('[App] Falha ao criar elemento de mensagem:', message);
		}
	});
	
	console.log('[App] Total de elementos de mensagem no DOM:', elements.messagesContainer.querySelectorAll('.message').length);
	
	// Scroll para o final após renderizar
	scrollToBottom();
}

function createMessageElement(message) {
	const messageElement = document.createElement('div');
	messageElement.className = `message ${message.sender === 'user' ? 'sent' : 'received'} ${message.status || 'sent'}`;
	messageElement.setAttribute('role', 'article');
	messageElement.setAttribute('aria-label', `Mensagem ${message.sender === 'user' ? 'enviada' : 'recebida'}: ${message.text}`);
	messageElement.setAttribute('data-message-id', message.id);

	const time = formatTime(message.timestamp);
	const statusIcon = message.sender === 'user' ? getStatusIcon(message.status) : '';

	messageElement.innerHTML = `
        <div class="message-text">${message.text}</div>
        <div class="message-time">${time} ${statusIcon}</div>
    `;

	return messageElement;
}

function getStatusIcon(status) {
	switch (status) {
		case 'sent':
			return '<i class="fas fa-check" style="margin-left: 4px; opacity: 0.6;"></i>';
		case 'delivered':
			return '<i class="fas fa-check-double" style="margin-left: 4px; opacity: 0.6;"></i>';
		case 'read':
			return '<i class="fas fa-check-double" style="margin-left: 4px; color: #4CAF50;"></i>';
		default:
			return '<i class="fas fa-clock" style="margin-left: 4px; opacity: 0.6;"></i>';
	}
}

async function sendMessage() {
	const text = elements.messageInput.value.trim();

	if (!text || !state.currentChatUserId) {
		console.warn('[App] Não é possível enviar mensagem: texto vazio ou chat não selecionado');
		return;
	}

	// Limpar campo de entrada
	elements.messageInput.value = '';
	adjustTextareaHeight();

	// Desabilitar botão de envio temporariamente
	elements.sendBtn.disabled = true;

	// Criar mensagem temporária para feedback imediato
	const tempMessage = {
		id: 'temp-' + Date.now(),
		text: text,
		sender: 'user',
		timestamp: new Date().toISOString(),
		status: 'sending'
	};

	// Garantir que state.messages existe
	if (!state.messages) {
		state.messages = [];
	}
	
	state.messages.push(tempMessage);
	console.log('[App] Mensagem temporária adicionada. Total:', state.messages.length);
	renderMessages();
	scrollToBottom();

	try {
		const token = localStorage.getItem('token') || localStorage.getItem('jwtToken');
		if (!token) {
			throw new Error('Token não encontrado');
		}

		// SEMPRE enviar via API REST primeiro para garantir que seja salva no banco
		const response = await fetch('http://localhost:8080/api/chat/messages', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				destinatarioId: state.currentChatUserId,
				conteudo: text
			})
		});

		if (response.ok) {
			const sentMessage = await response.json();
			console.log('[App] Mensagem salva no banco:', sentMessage);
			
			// Atualizar mensagem temporária com dados reais do banco
			const index = state.messages.findIndex(m => m.id === tempMessage.id);
			if (index !== -1) {
				// Converter formato do backend para formato do frontend
				const remetenteId = sentMessage.remetente ? (sentMessage.remetente.id || sentMessage.remetente.id_usuario) : null;
				const isSent = remetenteId && state.currentUserId && (
					parseInt(remetenteId) === parseInt(state.currentUserId)
				);
				
				state.messages[index] = {
					id: sentMessage.id || sentMessage.id_mensagem,
					text: sentMessage.conteudo || sentMessage.content || text,
					sender: 'user',
					timestamp: sentMessage.criadoEm || sentMessage.criado_em || tempMessage.timestamp,
					status: 'delivered'
				};
				console.log('[App] Mensagem atualizada com dados do banco:', state.messages[index]);
				
				// Atualizar timestamp da última mensagem
				state.lastMessageTimestamp = state.messages[index].timestamp;
				
				renderMessages();
				scrollToBottom();
			}

			// Também enviar via WebSocket para notificação em tempo real (opcional)
			if (state.wsConnection && state.wsConnection.send && state.currentChatUserId) {
				try {
					state.wsConnection.send({
						content: text,
						type: 'CHAT'
					}, state.currentChatUserId);
					console.log('[App] Mensagem também enviada via WebSocket');
				} catch (wsError) {
					console.warn('[App] Erro ao enviar via WebSocket (não crítico):', wsError);
				}
			}
		} else {
			const errorText = await response.text();
			throw new Error(`Erro ao salvar mensagem: ${response.status} - ${errorText}`);
		}

		// Atualizar última mensagem na lista de chats
		updateChatPreview(state.currentChatId, text);

	} catch (error) {
		console.error('[App] Erro ao enviar mensagem:', error);

		// Marcar mensagem como falha
		const index = state.messages.findIndex(m => m.id === tempMessage.id);
		if (index !== -1) {
			state.messages[index].status = 'error';
			state.messages[index].text = `${text} (falha no envio)`;
			renderMessages();
		}

		showError('Erro ao enviar mensagem. Tente novamente.');

	} finally {
		elements.sendBtn.disabled = false;
		elements.messageInput.focus();
	}
}

function simulateAutoReply() {
	// Mostrar indicador de digitação
	showTypingIndicator();

	// Simular tempo de digitação
	setTimeout(() => {
		hideTypingIndicator();

		// Adicionar resposta automática
		const autoReplies = [
			"Olá! Recebemos sua mensagem 😊 Em breve retornaremos com mais informações sobre as doações disponíveis.",
			"Obrigado pelo seu interesse! Nossas doações estão disponíveis para retirada das 14h às 18h.",
			"Perfeito! Anotamos seu pedido. Pode vir buscar amanhã a partir das 14h.",
			"Temos disponíveis hoje: pães integrais, frutas da estação e legumes orgânicos. Interessado em algum?",
			"Vamos verificar a disponibilidade e retornamos em alguns minutos! 📝"
		];

		const randomReply = autoReplies[Math.floor(Math.random() * autoReplies.length)];

		const autoReply = {
			id: Date.now(),
			text: randomReply,
			sender: "contact",
			timestamp: new Date().toISOString(),
			status: "delivered"
		};

		state.messages.push(autoReply);
		renderMessages();
		scrollToBottom();

		// Atualizar preview do chat
		updateChatPreview(state.currentChatId, randomReply);

	}, 2000 + Math.random() * 2000); // Tempo aleatório entre 2-4 segundos
}

function updateChatPreview(chatId, lastMessage) {
	const chat = state.chats.find(c => c.id === chatId);
	if (chat) {
		chat.lastMessage = lastMessage;
		chat.timestamp = new Date().toISOString();
		renderChatList();
	}
}

function connectWebSocket() {
	if (!state.currentUserId) {
		console.error('[WebSocket] ID do usuário não disponível');
		return;
	}

	state.wsConnection = apiClient.connectWS(
		// Callback para novas mensagens
		(message) => {
			handleWebSocketMessage(message);
		},
		// Callback para mudanças de status
		(status) => {
			handleWebSocketStatus(status);
			// Se WebSocket desconectar, garantir que polling está ativo
			if (status === 'disconnected' || status === 'error') {
				if (!state.pollingInterval) {
					startPolling();
				}
			} else if (status === 'connected') {
				// Se WebSocket conectar, parar polling (WebSocket é mais eficiente)
				stopPolling();
				console.log('[WebSocket] Conectado - mensagens em tempo real ativadas');
			}
		},
		// ID do usuário atual
		state.currentUserId
	);
}

// Sistema de polling para verificar novas mensagens (fallback se WebSocket não funcionar)
function startPolling() {
	// Parar polling anterior se existir
	stopPolling();
	
	// Só iniciar polling se houver um chat aberto
	if (!state.currentChatUserId || !state.currentUserId) {
		console.log('[Polling] Não há chat aberto, aguardando...');
		return;
	}
	
	console.log('[Polling] Iniciando verificação periódica de novas mensagens para chat:', state.currentChatUserId);
	
	// Verificar novas mensagens a cada 3 segundos
	state.pollingInterval = setInterval(async () => {
		if (!state.currentChatUserId || !state.currentUserId) {
			// Se não há chat aberto, parar polling
			stopPolling();
			return;
		}
		
		try {
			const token = localStorage.getItem('token') || localStorage.getItem('jwtToken');
			if (!token) return;
			
			// Buscar mensagens mais recentes que a última conhecida
			const response = await fetch(`http://localhost:8080/api/chat/conversations/${state.currentChatUserId}`, {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});
			
			if (response.ok) {
				const messages = await response.json();
				
				// Filtrar apenas mensagens novas
				const newMessages = messages.filter(msg => {
					// Se não temos timestamp de última mensagem, considerar todas como novas na primeira vez
					if (!state.lastMessageTimestamp) {
						return true;
					}
					
					const msgTimestamp = msg.criadoEm || msg.criado_em || msg.timestamp;
					if (!msgTimestamp) return false;
					
					// Converter para Date para comparação
					let msgDate = msgTimestamp;
					if (typeof msgDate === 'string' && !msgDate.includes('T')) {
						msgDate = msgDate.replace(' ', 'T');
					}
					
					return new Date(msgDate) > new Date(state.lastMessageTimestamp);
				});
				
				if (newMessages.length > 0) {
					console.log('[Polling] Encontradas', newMessages.length, 'novas mensagens');
					
					// Buscar ID do usuário atual se não tiver
					let currentUserId = state.currentUserId;
					if (!currentUserId && state.currentUser) {
						currentUserId = state.currentUser.id;
					}
					
					// Adicionar novas mensagens ao estado
					newMessages.forEach(msg => {
						const remetenteId = msg.remetente ? (msg.remetente.id || msg.remetente.id_usuario) : null;
						const isSent = remetenteId && currentUserId && (
							parseInt(remetenteId) === parseInt(currentUserId)
						);
						
						let timestamp = msg.criadoEm || msg.criado_em || msg.timestamp;
						if (timestamp && typeof timestamp === 'string' && !timestamp.includes('T')) {
							timestamp = timestamp.replace(' ', 'T');
						}
						if (!timestamp) {
							timestamp = new Date().toISOString();
						}
						
						const newMessage = {
							id: msg.id || msg.id_mensagem,
							text: msg.conteudo || msg.content || '',
							sender: isSent ? 'user' : 'contact',
							timestamp: timestamp,
							status: msg.lido ? 'read' : 'delivered'
						};
						
						// Verificar se já existe
						const exists = state.messages.some(m => m.id === newMessage.id);
						if (!exists) {
							state.messages.push(newMessage);
							console.log('[Polling] Nova mensagem adicionada:', newMessage.text.substring(0, 50));
						}
					});
					
					// Atualizar timestamp da última mensagem
					if (newMessages.length > 0) {
						const lastMsg = newMessages[newMessages.length - 1];
						const lastTimestamp = lastMsg.criadoEm || lastMsg.criado_em || lastMsg.timestamp;
						if (lastTimestamp) {
							let ts = lastTimestamp;
							if (typeof ts === 'string' && !ts.includes('T')) {
								ts = ts.replace(' ', 'T');
							}
							state.lastMessageTimestamp = ts;
						}
					}
					
					// Renderizar mensagens
					renderMessages();
					scrollToBottom();
					
					// Atualizar preview
					if (state.currentChatId && newMessages.length > 0) {
						const lastNewMsg = newMessages[newMessages.length - 1];
						updateChatPreview(state.currentChatId, lastNewMsg.conteudo || lastNewMsg.content);
					}
				}
			}
		} catch (error) {
			console.error('[Polling] Erro ao verificar novas mensagens:', error);
		}
	}, 3000); // Verificar a cada 3 segundos
}

function stopPolling() {
	if (state.pollingInterval) {
		console.log('[Polling] Parando verificação periódica');
		clearInterval(state.pollingInterval);
		state.pollingInterval = null;
	}
}

function handleWebSocketMessage(message) {
	console.log('[WebSocket] Processando mensagem:', message);
	
	switch (message.type) {
		case 'new_message':
			// Verificar se a mensagem tem data
			const messageData = message.data || message;
			const remetenteId = messageData.remetenteId;
			
			if (!remetenteId) {
				console.warn('[WebSocket] Mensagem sem remetenteId:', messageData);
				return;
			}
			
			// Determinar se a mensagem é do chat atual
			// A mensagem é do chat atual se:
			// 1. O remetente é o usuário com quem estamos conversando (currentChatUserId)
			// 2. OU o remetente é o usuário atual e estamos em um chat (confirmação de envio)
			// 3. OU o destinatário é o usuário atual e o remetente é o currentChatUserId
			
			const isFromCurrentChatUser = remetenteId && state.currentChatUserId && (
				parseInt(remetenteId) === parseInt(state.currentChatUserId)
			);
			const isFromCurrentUser = remetenteId && state.currentUserId && (
				parseInt(remetenteId) === parseInt(state.currentUserId)
			);
			
			// Lógica simplificada: mensagem é do chat atual se:
			// 1. O remetente é o usuário com quem estamos conversando (currentChatUserId)
			// 2. OU o remetente é o usuário atual (confirmação de envio) e estamos em um chat
			// 3. OU estamos conversando com o remetente (currentChatUserId === remetenteId)
			
			// Verificar se a mensagem é para o chat atual
			// Se o remetente é o usuário com quem estamos conversando, é do chat atual
			// Se o remetente é o usuário atual e estamos em um chat, também é do chat atual (confirmação)
			const shouldShowMessage = state.currentChatUserId && (
				// Mensagem recebida: remetente é o usuário com quem estamos conversando
				parseInt(remetenteId) === parseInt(state.currentChatUserId) ||
				// Mensagem enviada: remetente é o usuário atual e estamos em um chat
				(parseInt(remetenteId) === parseInt(state.currentUserId) && state.currentChatUserId)
			);
			
			console.log('[WebSocket] Verificando chat:', {
				remetenteId,
				currentChatUserId: state.currentChatUserId,
				currentUserId: state.currentUserId,
				isFromCurrentChatUser,
				isFromCurrentUser,
				isCurrentChat,
				shouldShowMessage
			});
			
			if (shouldShowMessage) {
				// Determinar se a mensagem foi enviada pelo usuário atual
				const isSent = remetenteId && state.currentUserId && (
					parseInt(remetenteId) === parseInt(state.currentUserId)
				);
				
				// Obter texto da mensagem
				const messageText = messageData.text || messageData.content || '';
				if (!messageText) {
					console.warn('[WebSocket] Mensagem sem texto:', messageData);
					return;
				}
				
				// Adicionar mensagem ao chat atual
				const newMessage = {
					id: messageData.id || 'ws-' + Date.now(),
					text: messageText,
					sender: isSent ? 'user' : 'contact',
					timestamp: messageData.timestamp || new Date().toISOString(),
					status: messageData.status || 'delivered'
				};
				
				console.log('[WebSocket] Nova mensagem criada:', newMessage);
				
				// Evitar duplicatas - verificar por ID ou por texto e timestamp
				const exists = state.messages.some(m => {
					if (m.id && newMessage.id && m.id === newMessage.id) return true;
					if (m.text === newMessage.text) {
						const timeDiff = Math.abs(new Date(m.timestamp) - new Date(newMessage.timestamp));
						if (timeDiff < 5000) return true; // Mensagens com menos de 5 segundos de diferença
					}
					return false;
				});
				
				if (!exists) {
					// Se a mensagem foi enviada pelo usuário atual, atualizar a mensagem temporária
					if (isSent) {
						const tempIndex = state.messages.findIndex(m => m.id && m.id.toString().startsWith('temp-'));
						if (tempIndex !== -1) {
							console.log('[WebSocket] Atualizando mensagem temporária no índice:', tempIndex);
							state.messages[tempIndex] = newMessage;
						} else {
							// Verificar se já existe uma mensagem com o mesmo ID do banco
							const existingIndex = state.messages.findIndex(m => m.id === newMessage.id);
							if (existingIndex !== -1) {
								console.log('[WebSocket] Atualizando mensagem existente no índice:', existingIndex);
								state.messages[existingIndex] = newMessage;
							} else {
								console.log('[WebSocket] Adicionando nova mensagem do usuário');
								state.messages.push(newMessage);
							}
						}
					} else {
						console.log('[WebSocket] Adicionando nova mensagem do contato');
						state.messages.push(newMessage);
					}
					
					console.log('[WebSocket] Total de mensagens:', state.messages.length);
					
					// Atualizar timestamp da última mensagem
					state.lastMessageTimestamp = newMessage.timestamp;
					
					renderMessages();
					scrollToBottom();
					
					// Atualizar preview do chat
					if (state.currentChatId) {
						updateChatPreview(state.currentChatId, newMessage.text);
					}
				} else {
					console.log('[WebSocket] Mensagem duplicada ignorada');
				}
			} else {
				// Mensagem de outro chat - atualizar preview e incrementar não lidas
				const otherChatId = remetenteId;
				updateChatPreview(otherChatId, messageData.text || messageData.content);

				// Incrementar contador de não lidas
				const chat = state.chats.find(c => 
					(c.id && parseInt(c.id) === parseInt(otherChatId)) || 
					c.userId === parseInt(otherChatId)
				);
				if (chat) {
					chat.unread = (chat.unread || 0) + 1;
					renderChatList();
				} else {
					// Se não existe chat, criar um novo
					// Buscar informações do usuário do banco
					const token = localStorage.getItem('token') || localStorage.getItem('jwtToken');
					if (token) {
						fetch(`http://localhost:8080/api/user/${otherChatId}`, {
							headers: { 'Authorization': `Bearer ${token}` }
						}).then(res => {
							if (res.ok) {
								return res.json();
							}
							throw new Error('Erro ao buscar usuário');
						}).then(user => {
							const userName = user.nome || user.name || 'Usuário';
							const newChat = {
								id: parseInt(otherChatId),
								name: userName,
								avatar: userName.substring(0, 2).toUpperCase(),
								lastMessage: messageData.text || messageData.content,
								timestamp: new Date().toISOString(),
								unread: 1,
								type: 'user',
								online: true,
								userId: parseInt(otherChatId)
							};
							state.chats.push(newChat);
							renderChatList();
						}).catch(err => {
							console.error('[App] Erro ao buscar usuário:', err);
							// Criar chat com informações básicas
							const newChat = {
								id: parseInt(otherChatId),
								name: `Usuário ${otherChatId}`,
								avatar: 'U' + otherChatId,
								lastMessage: messageData.text || messageData.content,
								timestamp: new Date().toISOString(),
								unread: 1,
								type: 'user',
								online: true,
								userId: parseInt(otherChatId)
							};
							state.chats.push(newChat);
							renderChatList();
						});
					}
				}
			}
			break;

		case 'typing_start':
			if (message.chatId === state.currentChatId) {
				showTypingIndicator();
			}
			break;

		case 'typing_stop':
			if (message.chatId === state.currentChatId) {
				hideTypingIndicator();
			}
			break;

		case 'user_online':
			updateUserStatus(message.userId, true);
			break;

		case 'user_offline':
			updateUserStatus(message.userId, false);
			break;

		case 'message_status_update':
			// Atualizar status de uma mensagem (entregue/lida)
			const messageIndex = state.messages.findIndex(m => m.id === message.messageId);
			if (messageIndex !== -1) {
				state.messages[messageIndex].status = message.status;
				renderMessages();
			}
			break;

		default:
			console.log('[WebSocket] Mensagem desconhecida:', message);
	}
}

function handleWebSocketStatus(status) {
	state.isOnline = status === 'connected';
	updateConnectionStatus();

	if (status === 'connected') {
		console.log('[WebSocket] Conectado com sucesso');
		showNotification('Conectado', 'success');
	} else if (status === 'disconnected') {
		console.log('[WebSocket] Desconectado');
		showNotification('Conexão perdida', 'warning');
	} else if (status === 'error') {
		showNotification('Erro de conexão', 'error');
	}
}

function showTypingIndicator() {
	state.isTyping = true;
	elements.typingIndicator.classList.add('active');
	updateContactStatus('typing');
	scrollToBottom();
}

function hideTypingIndicator() {
	state.isTyping = false;
	elements.typingIndicator.classList.remove('active');

	// Restaurar status online do contato
	const chat = state.chats.find(c => c.id === state.currentChatId);
	if (chat) {
		updateContactStatus(chat.online ? 'online' : 'offline');
	}
}

function updateUserStatus(userId, online) {
	// Atualizar status na lista de chats
	const chat = state.chats.find(c => c.userId === userId);
	if (chat) {
		chat.online = online;
		renderChatList();
	}

	// Atualizar status no header se for o chat atual
	if (state.currentChatId && chat && chat.id === state.currentChatId) {
		updateContactStatus(online ? 'online' : 'offline');
	}
}

function updateContactStatus(status) {
	let statusElement = elements.contactStatus.querySelector('span');

	if (!statusElement) {
		statusElement = document.createElement('span');
		elements.contactStatus.appendChild(statusElement);
	}

	if (status === 'online') {
		statusElement.textContent = 'online';
		statusElement.className = 'status-online';
	} else if (status === 'offline') {
		statusElement.textContent = 'offline';
		statusElement.className = 'status-offline';
	} else if (status === 'typing') {
		statusElement.textContent = 'digitando...';
		statusElement.className = 'status-typing';
	}
}

function updateConnectionStatus() {
	if (state.isOnline) {
		elements.connectionStatus.className = 'connection-status online';
		elements.connectionStatus.innerHTML = '<i class="fas fa-wifi"></i><span>Conectado</span>';
		elements.connectionStatus.style.opacity = '1';

		// Ocultar após alguns segundos
		setTimeout(() => {
			elements.connectionStatus.style.opacity = '0';
		}, 3000);
	} else {
		elements.connectionStatus.className = 'connection-status offline';
		elements.connectionStatus.innerHTML = '<i class="fas fa-wifi-slash"></i><span>Offline</span>';
		elements.connectionStatus.style.opacity = '1';
	}
}

function setTheme(theme) {
	state.theme = theme;

	if (theme === 'dark') {
		document.body.classList.add('dark-theme');
		elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
		elements.themeToggle.setAttribute('aria-label', 'Alternar para tema claro');
	} else {
		document.body.classList.remove('dark-theme');
		elements.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
		elements.themeToggle.setAttribute('aria-label', 'Alternar para tema escuro');
	}

	// Salvar preferência
	localStorage.setItem('pratoJustoTheme', theme);
}

function formatTime(timestamp) {
	const date = new Date(timestamp);
	const now = new Date();
	const diff = now - date;

	// Se for hoje, mostrar apenas a hora
	if (diff < 86400000) {
		return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
	}

	// Se for esta semana, mostrar dia da semana
	if (diff < 604800000) {
		return date.toLocaleDateString('pt-BR', { weekday: 'short' });
	}

	// Caso contrário, mostrar data completa
	return date.toLocaleDateString('pt-BR');
}

function adjustTextareaHeight() {
	const textarea = elements.messageInput;
	textarea.style.height = 'auto';
	textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
}

function scrollToBottom() {
	setTimeout(() => {
		elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
	}, 100);
}

function setupEventListeners() {
	// Enviar mensagem ao clicar no botão
	elements.sendBtn.addEventListener('click', sendMessage);

	// Enviar mensagem ao pressionar Enter (mas não Shift+Enter)
	elements.messageInput.addEventListener('keydown', (e) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	});

	// Ajustar altura do textarea
	elements.messageInput.addEventListener('input', adjustTextareaHeight);

	// Alternar tema
	elements.themeToggle.addEventListener('click', () => {
		setTheme(state.theme === 'light' ? 'dark' : 'light');
	});

	// Alternar menu em dispositivos móveis
	elements.menuToggle.addEventListener('click', (e) => {
		e.stopPropagation();
		elements.sidebar.classList.toggle('active');
	});

	// Fechar menu ao clicar fora (em mobile)
	document.addEventListener('click', (e) => {
		if (window.innerWidth < 769 &&
			!elements.sidebar.contains(e.target) &&
			!elements.menuToggle.contains(e.target)) {
			elements.sidebar.classList.remove('active');
		}
	});

	// Inicializar seletor de emojis
	initializeEmojiPicker();
	
	// Botão de emoji - toggle do seletor
	elements.emojiBtn.addEventListener('click', (e) => {
		e.stopPropagation();
		if (elements.emojiPicker) {
			const isVisible = elements.emojiPicker.style.display !== 'none';
			elements.emojiPicker.style.display = isVisible ? 'none' : 'block';
		}
	});
	
	// Fechar seletor de emojis ao clicar fora
	document.addEventListener('click', (e) => {
		if (elements.emojiPicker && 
			!elements.emojiPicker.contains(e.target) && 
			!elements.emojiBtn.contains(e.target)) {
			elements.emojiPicker.style.display = 'none';
		}
	});

	// Habilitar/desabilitar botão de envio baseado no conteúdo
	elements.messageInput.addEventListener('input', () => {
		const hasText = elements.messageInput.value.trim() !== '';
		elements.sendBtn.disabled = !hasText || !state.currentChatUserId;
		adjustTextareaHeight();
	});

	// Inicialmente desabilitar botão de envio
	elements.sendBtn.disabled = true;

	// Simular mudança de status de conexão para demonstração
	setInterval(() => {
		// Em uma implementação real, isso verificaria o status real da conexão
		if (Math.random() > 0.98) { // 2% de chance de mudança
			state.isOnline = !state.isOnline;
			updateConnectionStatus();

			// Simular reconexão automática
			if (!state.isOnline) {
				setTimeout(() => {
					state.isOnline = true;
					updateConnectionStatus();
					if (state.wsConnection && state.wsConnection.reconnect) {
						state.wsConnection.reconnect();
					}
				}, 3000);
			}
		}
	}, 10000);

	// Focar no campo de mensagem ao carregar
	setTimeout(() => {
		elements.messageInput.focus();
	}, 500);
}

function showError(message) {
	const errorDiv = document.createElement('div');
	errorDiv.className = 'error-notification';
	errorDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <span>${message}</span>
    `;
	errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #f44336;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 8px;
    `;

	document.body.appendChild(errorDiv);

	setTimeout(() => {
		errorDiv.remove();
	}, 5000);
}

function showNotification(message, type = 'info') {
	const colors = {
		info: '#2196F3',
		success: '#4CAF50',
		warning: '#FF9800',
		error: '#f44336'
	};

	const icons = {
		info: 'info-circle',
		success: 'check',
		warning: 'exclamation-triangle',
		error: 'exclamation-circle'
	};

	const notification = document.createElement('div');
	notification.className = 'notification';
	notification.innerHTML = `
        <i class="fas fa-${icons[type]}"></i>
        <span>${message}</span>
    `;
	notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 8px;
        animation: slideInRight 0.3s ease;
    `;

	document.body.appendChild(notification);

	setTimeout(() => {
		notification.style.animation = 'slideOutRight 0.3s ease';
		setTimeout(() => {
			notification.remove();
		}, 300);
	}, 3000);
}

function showEmptyChatState(message = 'Selecione uma conversa para começar') {
	const emptyState = document.getElementById('emptyChatState');
	if (emptyState) {
		emptyState.style.display = 'flex';
		emptyState.style.flexDirection = 'column';
		emptyState.style.alignItems = 'center';
		emptyState.style.justifyContent = 'center';
		emptyState.style.height = '100%';
		const p = emptyState.querySelector('p');
		if (p) {
			p.textContent = message;
		}
	}
}

function hideEmptyChatState() {
	const emptyState = document.getElementById('emptyChatState');
	if (emptyState) {
		emptyState.style.display = 'none';
	}
}

// Inicializar seletor de emojis
function initializeEmojiPicker() {
	if (!elements.emojiGrid) return;
	
	// Limpar grid
	elements.emojiGrid.innerHTML = '';
	
	// Adicionar emojis ao grid
	emojis.forEach(emoji => {
		const emojiItem = document.createElement('div');
		emojiItem.className = 'emoji-item';
		emojiItem.textContent = emoji;
		emojiItem.setAttribute('aria-label', `Emoji ${emoji}`);
		
		emojiItem.addEventListener('click', () => {
			const textarea = elements.messageInput;
			const start = textarea.selectionStart;
			const end = textarea.selectionEnd;
			const text = textarea.value;
			
			textarea.value = text.substring(0, start) + emoji + text.substring(end);
			textarea.focus();
			textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
			
			adjustTextareaHeight();
			
			// Fechar seletor após escolher emoji
			if (elements.emojiPicker) {
				elements.emojiPicker.style.display = 'none';
			}
			
			// Atualizar estado do botão de envio
			elements.sendBtn.disabled = textarea.value.trim() === '' || !state.currentChatUserId;
		});
		
		elements.emojiGrid.appendChild(emojiItem);
	});
}

// Adicionar estilos CSS dinâmicos para animações
const style = document.createElement('style');
style.textContent = `
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
    
    .online-dot {
        display: inline-block;
        width: 6px;
        height: 6px;
        background: #4CAF50;
        border-radius: 50%;
        margin-left: 4px;
    }
`;
document.head.appendChild(style);

// Exportar para uso externo
if (typeof module !== 'undefined' && module.exports) {
	module.exports = { apiClient, state, initializeApp };
}