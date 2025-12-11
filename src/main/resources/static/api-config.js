// Configuração da API - Detecta automaticamente o host e protocolo corretos
// Funciona tanto em localhost quanto quando acessado de outros dispositivos na rede
// Resolve problemas de Mixed Content (HTTPS/HTTP)
(function() {
    'use strict';
    
    // Função para obter a URL base da API
    window.getApiBaseUrl = function() {
        const protocol = window.location.protocol; // 'http:' ou 'https:'
        const hostname = window.location.hostname;
        const currentPort = window.location.port;
        
        // Se a página está em HTTPS, a API também deve estar em HTTPS
        // Em produção (domínio real), usar o mesmo hostname e porta da página
        // Em desenvolvimento (localhost), usar porta 8080
        let apiPort = '';
        
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            // Desenvolvimento local - sempre usar porta 8080
            apiPort = ':8080';
        } else {
            // Produção - usar a mesma porta da página atual
            // Se não há porta explícita, não adicionar (usa porta padrão do protocolo)
            if (currentPort && currentPort !== '80' && currentPort !== '443') {
                apiPort = `:${currentPort}`;
            } else {
                // Sem porta explícita - usar porta padrão do protocolo (80 para HTTP, 443 para HTTPS)
                apiPort = '';
            }
        }
        
        // Construir URL da API usando o mesmo protocolo da página
        const apiUrl = `${protocol}//${hostname}${apiPort}`;
        return apiUrl;
    };
    
    // Variável global para compatibilidade com código existente
    window.API_BASE_URL = window.getApiBaseUrl();
    
    // Configuração da API Key do Google Maps
    // Para obter uma chave: https://console.cloud.google.com/google/maps-apis
    // IMPORTANTE: Configure restrições de API no Google Cloud Console para segurança
    window.GOOGLE_MAPS_API_KEY = 'AIzaSyDZAn9lL-mIiz0bB9pT8QtIqGQT6GRyARc';
    
    // Log para debug (pode ser removido em produção)
    console.log('API Base URL configurada:', window.API_BASE_URL);
    console.log('Protocolo da página:', window.location.protocol);
    console.log('Hostname:', window.location.hostname);
    console.log('Porta atual:', window.location.port);
})();

