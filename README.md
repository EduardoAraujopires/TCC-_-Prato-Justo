Prato Justo - Plataforma de Doação e Troca de Alimentos
<div align="center">

Conectando doadores e receptores para combater o desperdício de alimentos

</div>
📖 Sumário
📋 Visão Geral

🎯 Objetivos

✨ Funcionalidades

🏗️ Arquitetura

⚙️ Tecnologias

🚀 Instalação

🔧 Configuração

📁 Estrutura do Projeto

📊 Diagramas

🧪 API Endpoints

🔐 Segurança

🧪 Testes

🌐 Deploy

👥 Equipe

📄 Licença

📋 Visão Geral
O Prato Justo é uma plataforma digital desenvolvida como Trabalho de Conclusão de Curso do Técnico em Informática da ETEC de Itaquaquecetuba. A plataforma conecta doadores de alimentos excedentes (pessoas físicas, estabelecimentos comerciais e organizações) a receptores que necessitam de alimentos, promovendo a redução do desperdício e incentivando a solidariedade.

🎯 Contexto do Problema
Brasil desperdiça 27 milhões de toneladas de alimentos/ano (ONU)

33,1 milhões de brasileiros em situação de fome (Rede Penssan, 2022)

Falta de conexão eficiente entre doadores e receptores

Dificuldades logísticas e de segurança nas doações

🎯 Solução Proposta
Plataforma web/mobile que facilita o processo de doação através de:

📍 Geolocalização para conexão local

💬 Chat integrado para combinar entregas

⭐ Sistema de reputação para segurança

✅ Verificação de perfis (ONGs e estabelecimentos)

📱 Interface intuitiva e acessível

🎯 Objetivos
🎯 Objetivo Geral
Desenvolver uma plataforma digital que facilite o compartilhamento de alimentos, conectando pessoas físicas, estabelecimentos e instituições sem fins lucrativos.

🎯 Objetivos Específicos
Mapear fatores que contribuem para o desperdício de alimentos

Investigar necessidades de doadores e receptores via Design Thinking

Analisar soluções existentes (benchmarking)

Desenvolver protótipo funcional com Spring Boot

Validar solução com usuários reais

📊 Alinhamento com ODS (ONU)
✅ ODS 2 - Fome Zero e Agricultura Sustentável

✅ ODS 12 - Consumo e Produção Responsáveis (Meta 12.3: reduzir desperdício pela metade até 2030)

✨ Funcionalidades
👤 Para Usuários Gerais
Funcionalidade	Descrição	Status
Cadastro	Registro de usuários individuais	✅
Login/Logout	Autenticação segura com JWT	✅
Perfil	Gerenciamento de dados do usuário	✅
Geolocalização	Baseada em endereço/LAT-LONG	✅
🎁 Para Doadores
Funcionalidade	Descrição	Status
Cadastrar Itens	Adicionar alimentos para doação	✅
Gerenciar Itens	Editar/remover itens cadastrados	✅
Visualizar Solicitações	Ver quem solicitou seus itens	✅
Chat Integrado	Conversar com receptores	✅
Avaliações	Receber feedback das doações	✅
🙏 Para Receptores
Funcionalidade	Descrição	Status
Buscar Itens	Por localização e tipo	✅
Solicitar Itens	Expressar interesse em itens	✅
Meus Pedidos	Acompanhar solicitações	✅
Chat Integrado	Combinar detalhes da coleta	✅
Avaliações	Avaliar doadores	✅
🏪 Para Estabelecimentos/ONGs
Funcionalidade	Descrição	Status
Perfil Verificado	Selo de confiabilidade	✅
Doações em Lote	Múltiplos itens simultaneamente	✅
Dashboard	Estatísticas de doações	🔄
Relatórios	Impacto social gerado	🔄
🛡️ Sistema
Funcionalidade	Descrição	Status
Moderação	Gestão de usuários e conteúdo	✅
Notificações	Alertas por email/chat	🔄
Backup Automático	Dados seguros	✅
Logs de Auditoria	Rastreabilidade	✅


⚙️ Tecnologias
🎯 Backend
Tecnologia	Versão	Finalidade
Java	21	Linguagem principal
Spring Boot	3.5.5	Framework backend
Spring Security	6.x	Autenticação/autorização
Spring Data JPA	3.x	Persistência de dados
JWT	0.11.5	Tokens de autenticação
WebSocket	3.x	Chat em tempo real
Bean Validation	3.x	Validação de dados
🗄️ Banco de Dados
Tecnologia	Versão	Finalidade
MySQL	8.0+	Produção
H2 Database	2.x	Desenvolvimento/Testes
JPA/Hibernate	6.x	ORM
🛠️ Ferramentas de Desenvolvimento
Ferramenta	Finalidade
Maven	Gerenciamento de dependências
Git	Controle de versão
Postman	Testes de API
Docker	Containerização
Figma	Prototipagem de UI
📱 Frontend (Prototipado)
Tecnologia	Status	Observação
Figma	✅	Wireframes e protótipos
HTML/CSS/JS	🔄	Futura implementação
React/Angular	🎯	Próxima fase
🚀 Instalação
📋 Pré-requisitos
1. Software Necessário
Java JDK 21+

Maven 3.6+

MySQL 8.0+

Git

2. Configuração do Ambiente
bash
# Verificar instalações
java -version
mvn -v
mysql --version
git --version
📥 Clonar e Configurar
1. Clonar Repositório
bash
git clone https://github.com/seu-usuario/prato-justo.git
cd prato-justo
2. Configurar Banco de Dados MySQL
sql
-- Conectar ao MySQL
mysql -u root -p

-- Criar banco de dados
CREATE DATABASE prato_justo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Criar usuário dedicado
CREATE USER 'prato_user'@'localhost' IDENTIFIED BY 'SenhaSegura123!';

-- Conceder privilégios
GRANT ALL PRIVILEGES ON prato_justo_db.* TO 'prato_user'@'localhost';

-- Aplicar mudanças
FLUSH PRIVILEGES;

-- Sair
EXIT;
3. Configurar Arquivo de Propriedades
Crie/edite src/main/resources/application.properties:

properties
# ===============================
# CONFIGURAÇÕES DO SERVIDOR
# ===============================
server.port=8080
server.servlet.context-path=/api

# ===============================
# BANCO DE DADOS - PRODUÇÃO (MySQL)
# ===============================
spring.datasource.url=jdbc:mysql://localhost:3306/prato_justo_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=prato_user
spring.datasource.password=SenhaSegura123!
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# ===============================
# BANCO DE DADOS - DESENVOLVIMENTO (H2)
# ===============================
# spring.datasource.url=jdbc:h2:mem:pratodb
# spring.datasource.driverClassName=org.h2.Driver
# spring.datasource.username=sa
# spring.datasource.password=
# spring.h2.console.enabled=true
# spring.h2.console.path=/h2-console

# ===============================
# CONFIGURAÇÕES JPA/HIBERNATE
# ===============================
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.jdbc.batch_size=20
spring.jpa.properties.hibernate.order_inserts=true
spring.jpa.properties.hibernate.order_updates=true

# ===============================
# CONFIGURAÇÕES JWT
# ===============================
jwt.secret=Pr4t0Just0S3cr3tK3y2025ETECItaqua@DevTeam#SecureJWT
jwt.expiration=86400000 # 24 horas em milissegundos
jwt.refresh-expiration=604800000 # 7 dias

# ===============================
# CONFIGURAÇÕES DE SEGURANÇA
# ===============================
spring.security.filter.dispatcher-types=REQUEST,ASYNC,ERROR
cors.allowed-origins=http://localhost:3000,http://localhost:8080
cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
cors.allowed-headers=*
cors.allow-credentials=true

# ===============================
# CONFIGURAÇÕES DE LOG
# ===============================
logging.level.com.tcc=DEBUG
logging.level.org.springframework.web=INFO
logging.level.org.hibernate=WARN
logging.file.name=logs/prato-justo.log
logging.pattern.file=%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n

# ===============================
# CONFIGURAÇÕES DA APLICAÇÃO
# ===============================
app.name=Prato Justo
app.version=1.0.0
app.description=Plataforma de doação e troca de alimentos
app.contact.email=contato@pratojusto.org
app.contact.phone=+55 (11) 99999-9999

# ===============================
# CONFIGURAÇÕES DE GEO-LOCALIZAÇÃO
# ===============================
app.geolocation.radius-km=10
app.geolocation.update-interval=3600000 # 1 hora

# ===============================
# CONFIGURAÇÕES DE NOTIFICAÇÃO
# ===============================
app.notification.email.enabled=true
app.notification.email.smtp.host=smtp.gmail.com
app.notification.email.smtp.port=587
app.notification.email.smtp.auth=true
app.notification.email.smtp.starttls.enable=true
4. Compilar o Projeto
bash
# Limpar e compilar
mvn clean compile

# Ou compilar e empacotar
mvn clean package -DskipTests
5. Executar a Aplicação
bash
# Modo desenvolvimento
mvn spring-boot:run

# Ou executar o JAR
java -jar target/Prato_Justo-0.0.1-SNAPSHOT.jar
6. Verificar Funcionamento
API: http://localhost:8080/api

Health Check: http://localhost:8080/api/actuator/health

H2 Console (se habilitado): http://localhost:8080/h2-console

🔧 Configuração Avançada
🔐 Configuração de Ambiente
1. Perfis do Spring
Crie arquivos específicos para cada ambiente:

application-dev.properties (Desenvolvimento):

properties
spring.profiles.active=dev
spring.datasource.url=jdbc:h2:mem:pratodb
spring.jpa.hibernate.ddl-auto=create-drop
application-prod.properties (Produção):

properties
spring.profiles.active=prod
spring.datasource.url=jdbc:mysql://prod-db:3306/prato_justo_prod
spring.jpa.hibernate.ddl-auto=validate
2. Executar com Perfil Específico
bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
🐳 Configuração Docker
1. Dockerfile
dockerfile
FROM openjdk:21-jdk-slim

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Variáveis de ambiente
ENV APP_HOME=/app
ENV JAVA_OPTS=""

# Criar diretório da aplicação
WORKDIR $APP_HOME

# Copiar o JAR da aplicação
COPY target/Prato_Justo-0.0.1-SNAPSHOT.jar app.jar

# Expor porta
EXPOSE 8080

# Comando de execução
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
2. Docker Compose
yaml
version: '3.8'

services:
  prato-justo-db:
    image: mysql:8.0
    container_name: prato-justo-mysql
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: prato_justo_db
      MYSQL_USER: prato_user
      MYSQL_PASSWORD: SenhaSegura123!
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./mysql-init:/docker-entrypoint-initdb.d
    networks:
      - prato-justo-network

  prato-justo-app:
    build: .
    container_name: prato-justo-app
    depends_on:
      - prato-justo-db
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://prato-justo-db:3306/prato_justo_db
      SPRING_DATASOURCE_USERNAME: prato_user
      SPRING_DATASOURCE_PASSWORD: SenhaSegura123!
      SPRING_PROFILES_ACTIVE: prod
    ports:
      - "8080:8080"
    networks:
      - prato-justo-network
    restart: unless-stopped

volumes:
  mysql_data:

networks:
  prato-justo-network:
    driver: bridge
3. Scripts de Inicialização MySQL
Crie mysql-init/init.sql:

sql
-- Inicialização do banco de dados
USE prato_justo_db;

-- Tabela de usuários (exemplo estendido)
CREATE TABLE IF NOT EXISTS usuarios (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo ENUM('INDIVIDUAL', 'ESTABELECIMENTO', 'ONG') NOT NULL,
    cpf_cnpj VARCHAR(20),
    telefone VARCHAR(20),
    endereco TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    reputacao DECIMAL(3, 2) DEFAULT 5.00,
    verificado BOOLEAN DEFAULT FALSE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_tipo (tipo),
    INDEX idx_localizacao (latitude, longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


🔄 Diagrama de Sequência - Processo de Doação
🧪 API Endpoints
🔐 Autenticação
POST /api/auth/register - Registrar novo usuário
Request:

json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "Senha123!",
  "tipo": "INDIVIDUAL",
  "telefone": "(11) 99999-9999",
  "endereco": "Rua das Flores, 123",
  "latitude": -23.5505,
  "longitude": -46.6333
}
Response (201 Created):

json
{
  "id": 1,
  "nome": "João Silva",
  "email": "joao@email.com",
  "tipo": "INDIVIDUAL",
  "mensagem": "Usuário registrado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4K"
}
POST /api/auth/login - Login de usuário
Request:

json
{
  "email": "joao@email.com",
  "senha": "Senha123!"
}
Response (200 OK):

json
{
  "id": 1,
  "nome": "João Silva",
  "email": "joao@email.com",
  "tipo": "INDIVIDUAL",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4K",
  "expiresIn": 86400000
}
POST /api/auth/refresh - Refresh token
Request:

json
{
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4K"
}
Response (200 OK):

json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "bmV3IHJlZnJlc2ggdG9rZW4K",
  "expiresIn": 86400000
}
👤 Usuários
GET /api/users/me - Obter perfil do usuário logado
Headers: Authorization: Bearer {token}
Response (200 OK):

json
{
  "id": 1,
  "nome": "João Silva",
  "email": "joao@email.com",
  "tipo": "INDIVIDUAL",
  "telefone": "(11) 99999-9999",
  "endereco": "Rua das Flores, 123",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "reputacao": 4.5,
  "totalDoacoes": 12,
  "totalRecebimentos": 3,
  "dataCriacao": "2025-01-15T10:30:00",
  "verificado": true
}
PUT /api/users/me - Atualizar perfil
Headers: Authorization: Bearer {token}
Request:

json
{
  "nome": "João Silva Santos",
  "telefone": "(11) 98888-8888",
  "endereco": "Avenida Paulista, 1000",
  "latitude": -23.5614,
  "longitude": -46.6561
}
🎁 Itens para Doação
GET /api/items - Listar itens disponíveis
Query Parameters:

latitude (opcional): -23.5505

longitude (opcional): -46.6333

raioKm (opcional, padrão=10): 5

categoria (opcional): "VERDURAS", "FRUTAS", "GRÃOS", "OUTROS"

page (opcional, padrão=0): 0

size (opcional, padrão=20): 10

Response (200 OK):

json
{
  "content": [
    {
      "id": 1,
      "nome": "Maçã",
      "descricao": "Maçãs frescas da safra",
      "quantidade": 5,
      "unidadeMedida": "KG",
      "validade": "2025-12-25",
      "categoria": "FRUTAS",
      "status": "DISPONIVEL",
      "doador": {
        "id": 2,
        "nome": "Supermercado ABC",
        "reputacao": 4.8,
        "distanciaKm": 2.3
      },
      "dataCadastro": "2025-12-17T14:30:00",
      "restricoes": ["SEM_GLUTEN", "VEGANO"]
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 45,
  "totalPages": 5
}
POST /api/items - Cadastrar novo item
Headers: Authorization: Bearer {token}
Request:

json
{
  "nome": "Arroz",
  "descricao": "Arroz integral orgânico",
  "quantidade": 3,
  "unidadeMedida": "KG",
  "validade": "2026-06-30",
  "categoria": "GRÃOS",
  "restricoes": ["SEM_GLUTEN", "VEGANO"]
}
PUT /api/items/{id} - Atualizar item
Headers: Authorization: Bearer {token}

json
{
  "quantidade": 2,
  "validade": "2026-07-15",
  "status": "DISPONIVEL"
}
DELETE /api/items/{id} - Remover item
Headers: Authorization: Bearer {token}
Response (204 No Content)

🤝 Solicitações
POST /api/solicitacoes - Solicitar item
Headers: Authorization: Bearer {token}
Request:

json
{
  "itemId": 1,
  "mensagem": "Olá, gostaria de receber este item. Podemos combinar a coleta?"
}
GET /api/solicitacoes/minhas - Minhas solicitações
Headers: Authorization: Bearer {token}
Query Parameters:

tipo (opcional): "ENVIADAS" ou "RECEBIDAS"

status (opcional): "PENDENTE", "ACEITA", "RECUSADA", "CONCLUIDA"

PUT /api/solicitacoes/{id}/status - Atualizar status da solicitação
Headers: Authorization: Bearer {token}
Request:

json
{
  "status": "ACEITA",
  "mensagem": "Aceito sua solicitação. Vamos combinar a entrega!"
}
💬 Chat
WebSocket Connection
Endpoint: ws://localhost:8080/ws/chat
Protocol: STOMP

Subscribe to:

/user/{userId}/queue/messages - Mensagens privadas

/topic/public - Mensagens públicas (admin)

Send to:

/app/chat.sendPrivateMessage - Enviar mensagem privada

/app/chat.sendPublicMessage - Enviar mensagem pública (admin)

Payload:

json
{
  "senderId": 1,
  "recipientId": 2,
  "content": "Olá, podemos combinar para amanhã às 15h?",
  "solicitacaoId": 5,
  "timestamp": "2025-12-17T14:30:00Z"
}
📊 Relatórios
GET /api/relatorios/impacto - Relatório de impacto
Headers: Authorization: Bearer {token}
Query Parameters:

dataInicio (opcional): 2025-01-01

dataFim (opcional): 2025-12-31

Response (200 OK):

json
{
  "totalDoacoes": 150,
  "totalItensDoados": 1250,
  "totalReceptoresBeneficiados": 89,
  "desperdicioEvitadoKg": 875.5,
  "impactoFinanceiro": 12500.75,
  "topDoadores": [
    {"id": 2, "nome": "Supermercado ABC", "doacoes": 45},
    {"id": 5, "nome": "Padaria Delícia", "doacoes": 32}
  ],
  "distribuicaoCategorias": {
    "FRUTAS": 35,
    "VERDURAS": 28,
    "GRÃOS": 22,
    "OUTROS": 15
  },
  "tendenciaMensal": [
    {"mes": "Jan", "doacoes": 12},
    {"mes": "Fev", "doacoes": 15}
  ]
}
🔐 Segurança
🛡️ Configuração de Segurança
java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Endpoints públicos
                .requestMatchers("/api/auth/**", "/api/public/**", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                // Endpoints que requerem autenticação
                .requestMatchers("/api/users/**", "/api/items/**", "/api/solicitacoes/**").authenticated()
                // Endpoints administrativos
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.getWriter().write("{\"error\": \"Não autorizado\"}");
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.getWriter().write("{\"error\": \"Acesso negado\"}");
                })
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://localhost:8080"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
🔑 Implementação JWT
java
@Service
public class JwtService {
    
    @Value("${jwt.secret}")
    private String secretKey;
    
    @Value("${jwt.expiration}")
    private long jwtExpiration;
    
    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;
    
    public String generateToken(UserDetails userDetails) {
        return buildToken(userDetails, jwtExpiration);
    }
    
    public String generateRefreshToken(UserDetails userDetails) {
        return buildToken(userDetails, refreshExpiration);
    }
    
    private String buildToken(UserDetails userDetails, long expiration) {
        Map<String, Object> extraClaims = new HashMap<>();
        
        if (userDetails instanceof CustomUserDetails customUserDetails) {
            extraClaims.put("userId", customUserDetails.getId());
            extraClaims.put("userType", customUserDetails.getUserType());
        }
        
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }
    
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }
    
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
    
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
    
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }
    
    public Long extractUserId(String token) {
        return extractClaim(token, claims -> claims.get("userId", Long.class));
    }
    
    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }
    
    private Claims extractAllClaims(String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
    
    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
🔒 Criptografia de Senhas
java
@Configuration
public class PasswordConfig {
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
🧪 Testes
📋 Tipos de Testes
1. Testes Unitários
java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    
    @Mock
    private UserRepository userRepository;
    
    @Mock
    private PasswordEncoder passwordEncoder;
    
    @InjectMocks
    private UserService userService;
    
    @Test
    void givenValidUser_whenRegister_thenReturnUserResponse() {
        // Arrange
        RegisterRequest request = new RegisterRequest(
            "João Silva", 
            "joao@email.com", 
            "Senha123!", 
            UserType.INDIVIDUAL
        );
        
        User user = User.builder()
            .id(1L)
            .nome("João Silva")
            .email("joao@email.com")
            .tipo(UserType.INDIVIDUAL)
            .build();
        
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);
        
        // Act
        UserResponse response = userService.register(request);
        
        // Assert
        assertNotNull(response);
        assertEquals("João Silva", response.getNome());
        assertEquals("joao@email.com", response.getEmail());
        verify(userRepository, times(1)).save(any(User.class));
    }
}
2. Testes de Integração
java
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class ItemControllerIntegrationTest {
    
    @Container
    static MySQLContainer<?> mySQLContainer = new MySQLContainer<>("mysql:8.0")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test");
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Test
    @WithMockUser(username = "test@email.com", roles = {"USER"})
    void givenValidItem_whenCreate_thenReturnCreated() throws Exception {
        // Arrange
        ItemRequest request = new ItemRequest(
            "Maçã",
            "Maçãs frescas",
            5,
            "KG",
            LocalDate.now().plusDays(7),
            ItemCategory.FRUTAS
        );
        
        // Act & Assert
        mockMvc.perform(post("/api/items")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nome").value("Maçã"))
                .andExpect(jsonPath("$.quantidade").value(5));
    }
}
3. Testes de API com TestRestTemplate
java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class AuthControllerTest {
    
    @LocalServerPort
    private int port;
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Test
    void givenValidCredentials_whenLogin_thenReturnToken() {
        // Arrange
        LoginRequest loginRequest = new LoginRequest("admin@pratojusto.org", "admin123");
        
        // Act
        ResponseEntity<AuthResponse> response = restTemplate.postForEntity(
            "http://localhost:" + port + "/api/auth/login",
            loginRequest,
            AuthResponse.class
        );
        
        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody().getToken());
        assertNotNull(response.getBody().getRefreshToken());
    }
}
🚀 Executando os Testes
bash
# Executar todos os testes
mvn test

# Executar testes específicos
mvn test -Dtest=UserServiceTest
mvn test -Dtest=*IntegrationTest

# Executar com cobertura de código
mvn clean test jacoco:report

# Visualizar relatório de cobertura
open target/site/jacoco/index.html

# Executar testes com relatório detalhado
mvn test -Dspring.profiles.active=test
📊 Cobertura de Testes
Adicionar ao pom.xml:

xml
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.10</version>
    <executions>
        <execution>
            <goals>
                <goal>prepare-agent</goal>
            </goals>
        </execution>
        <execution>
            <id>report</id>
            <phase>test</phase>
            <goals>
                <goal>report</goal>
            </goals>
        </execution>
    </executions>
    <configuration>
        <excludes>
            <exclude>**/config/**</exclude>
            <exclude>**/dto/**</exclude>
            <exclude>**/model/**</exclude>
            <exclude>**/exception/**</exclude>
        </excludes>
    </configuration>
</plugin>
🌐 Deploy
🐳 Deploy com Docker
1. Build da Imagem
bash
# Build da aplicação
mvn clean package -DskipTests

# Build da imagem Docker
docker build -t prato-justo:latest .

# Ou usando docker-compose
docker-compose build
2. Executar com Docker Compose
bash
# Iniciar todos os serviços
docker-compose up -d

# Verificar logs
docker-compose logs -f prato-justo-app

# Parar serviços
docker-compose down

# Parar e remover volumes
docker-compose down -v
3. Verificar Status
bash
# Verificar containers em execução
docker ps

# Verificar logs da aplicação
docker logs prato-justo-app

# Verificar logs do banco de dados
docker logs prato-justo-mysql

# Executar comandos no container
docker exec -it prato-justo-app sh
☁️ Deploy em Nuvem (Exemplo: AWS)
1. Preparar Aplicação para Produção
properties
# application-prod.properties
spring.datasource.url=jdbc:mysql://${DB_HOST}:3306/${DB_NAME}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false

logging.level.root=WARN
logging.level.com.tcc=INFO

management.endpoints.web.exposure.include=health,info,metrics
management.endpoint.health.show-details=never
2. Script de Deploy AWS Elastic Beanstalk
bash
#!/bin/bash
# deploy-aws.sh

# Configurações
APP_NAME="prato-justo"
ENV_NAME="prato-justo-prod"
REGION="sa-east-1"
BUCKET="prato-justo-deploy"

# Build da aplicação
echo "Building application..."
mvn clean package -DskipTests -Pprod

# Criar arquivo de configuração do Elastic Beanstalk
cat > Dockerrun.aws.json << EOF
{
  "AWSEBDockerrunVersion": "1",
  "Image": {
    "Name": "prato-justo:latest",
    "Update": "true"
  },
  "Ports": [
    {
      "ContainerPort": "8080"
    }
  ],
  "Logging": "/var/log/nginx"
}
EOF

# Fazer upload para S3
echo "Uploading to S3..."
aws s3 cp target/Prato_Justo-0.0.1-SNAPSHOT.jar s3://$BUCKET/
aws s3 cp Dockerrun.aws.json s3://$BUCKET/

# Criar nova versão da aplicação
echo "Creating application version..."
aws elasticbeanstalk create-application-version \
  --application-name $APP_NAME \
  --version-label "v$(date +%Y%m%d%H%M%S)" \
  --source-bundle S3Bucket=$BUCKET,S3Key="Dockerrun.aws.json" \
  --region $REGION

# Deploy
echo "Deploying..."
aws elasticbeanstalk update-environment \
  --environment-name $ENV_NAME \
  --version-label "v$(date +%Y%m%d%H%M%S)" \
  --region $REGION

echo "Deployment completed!"
📦 Deploy Tradicional (VPS/Linux)
1. Script de Deploy
bash
#!/bin/bash
# deploy.sh

# Variáveis
APP_NAME="prato-justo"
APP_USER="pratoapp"
APP_DIR="/opt/$APP_NAME"
BACKUP_DIR="/backup/$APP_NAME"
LOG_DIR="/var/log/$APP_NAME"

# Criar diretórios necessários
sudo mkdir -p $APP_DIR $BACKUP_DIR $LOG_DIR
sudo chown -R $APP_USER:$APP_USER $APP_DIR $BACKUP_DIR $LOG_DIR

# Parar aplicação atual
echo "Stopping current application..."
sudo systemctl stop $APP_NAME.service || true

# Backup do banco de dados
echo "Creating database backup..."
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql

# Fazer backup da aplicação atual
echo "Backing up current application..."
tar -czf $BACKUP_DIR/app_$(date +%Y%m%d_%H%M%S).tar.gz $APP_DIR/*

# Copiar nova versão
echo "Copying new version..."
cp target/Prato_Justo-0.0.1-SNAPSHOT.jar $APP_DIR/
cp application-prod.properties $APP_DIR/
cp scripts/start.sh $APP_DIR/

# Configurar permissões
chmod +x $APP_DIR/start.sh
chown -R $APP_USER:$APP_USER $APP_DIR

# Iniciar aplicação
echo "Starting application..."
sudo systemctl start $APP_NAME.service

# Verificar status
sleep 10
sudo systemctl status $APP_NAME.service

# Verificar logs
tail -f $LOG_DIR/application.log
2. Systemd Service File
ini
# /etc/systemd/system/prato-justo.service
[Unit]
Description=Prato Justo Application
After=network.target mysql.service

[Service]
User=pratoapp
Group=pratoapp
WorkingDirectory=/opt/prato-justo
ExecStart=/usr/bin/java -jar Prato_Justo-0.0.1-SNAPSHOT.jar
ExecStop=/bin/kill -15 $MAINPID
Restart=always
RestartSec=10
StandardOutput=append:/var/log/prato-justo/application.log
StandardError=append:/var/log/prato-justo/error.log

[Install]
WantedBy=multi-user.target
3. Nginx como Proxy Reverso
nginx
# /etc/nginx/sites-available/prato-justo
server {
    listen 80;
    server_name pratojusto.org www.pratojusto.org;
    
    # Redirecionar HTTP para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name pratojusto.org www.pratojusto.org;
    
    # Configurações SSL
    ssl_certificate /etc/letsencrypt/live/pratojusto.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pratojusto.org/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Configurações de segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Logs
    access_log /var/log/nginx/prato-justo-access.log;
    error_log /var/log/nginx/prato-justo-error.log;
    
    # Proxy para a aplicação Spring Boot
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Cache para arquivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        proxy_pass http://localhost:8080;
    }
}
📈 Monitoramento
1. Health Checks
bash
# Verificar saúde da aplicação
curl https://pratojusto.org/api/actuator/health

# Verificar métricas
curl https://pratojusto.org/api/actuator/metrics

# Verificar informações
curl https://pratojusto.org/api/actuator/info
2. Script de Monitoramento
bash
#!/bin/bash
# monitor.sh

# Configurações
APP_URL="https://pratojusto.org/api/actuator/health"
ALERT_EMAIL="alerts@pratojusto.org"
LOG_FILE="/var/log/prato-justo/monitor.log"

# Função para verificar saúde
check_health() {
    response=$(curl -s -o /dev/null -w "%{http_code}" $APP_URL)
    
    if [ $response -eq 200 ]; then
        echo "$(date): Application is healthy (HTTP $response)" >> $LOG_FILE
        return 0
    else
        echo "$(date): Application is unhealthy (HTTP $response)" >> $LOG_FILE
        send_alert $response
        return 1
    fi
}

# Função para enviar alerta
send_alert() {
    status=$1
    echo "Application returned HTTP $status at $(date)" | mail -s "ALERT: Prato Justo is down" $ALERT_EMAIL
}

# Função para verificar recursos do sistema
check_resources() {
    # CPU
    cpu=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    
    # Memória
    mem=$(free | grep Mem | awk '{print $3/$2 * 100.0}')
    
    # Disco
    disk=$(df / | grep / | awk '{print $5}' | sed 's/%//g')
    
    echo "$(date): CPU: $cpu%, Memory: $mem%, Disk: $disk%" >> $LOG_FILE
    
    # Alertas se recursos estiverem altos
    if (( $(echo "$cpu > 80" | bc -l) )); then
        echo "High CPU usage: $cpu%" | mail -s "ALERT: High CPU" $ALERT_EMAIL
    fi
    
    if (( $(echo "$mem > 80" | bc -l) )); then
        echo "High Memory usage: $mem%" | mail -s "ALERT: High Memory" $ALERT_EMAIL
    fi
    
    if [ $disk -gt 80 ]; then
        echo "High Disk usage: $disk%" | mail -s "ALERT: High Disk" $ALERT_EMAIL
    fi
}

# Executar verificações
check_health
check_resources
👥 Equipe
👨‍💻 Desenvolvedores
Nome	Função	Responsabilidades
Eduardo Araújo Pires	Desenvolvedor Backend	Arquitetura, Spring Boot, Segurança
Felipe Gabriel de Oliveira Coelho	Desenvolvedor Full Stack	API, Banco de Dados, Frontend
Gustavo Araújo Pires	Desenvolvedor Backend	Business Logic, Testes, Deploy
Rafael Ádryan Dias Filho	DevOps & QA	Infraestrutura, CI/CD, Testes
👨‍🏫 Orientação
Orientador: Prof. Thiago Ribeiro Melo

Instituição: ETEC de Itaquaquecetuba

Curso: Técnico em Informática

Ano: 2025

🤝 Contribuições
Como Contribuir
Faça um Fork do projeto

Crie uma Branch para sua feature (git checkout -b feature/AmazingFeature)

Commit suas mudanças (git commit -m 'Add some AmazingFeature')

Push para a Branch (git push origin feature/AmazingFeature)

Abra um Pull Request

Padrões de Commit
text
feat: Nova funcionalidade
fix: Correção de bug
docs: Documentação
style: Formatação, ponto e vírgula, etc
refactor: Refatoração de código
test: Adicionando testes
chore: Manutenção
📞 Suporte
Canais de Comunicação
Email: contato@pratojusto.org

Issues: GitHub Issues

Documentação: Wiki do Projeto

Política de Suporte
Horário: Segunda a Sexta, 9h às 18h

Resposta: Até 48 horas úteis

Prioridade:

🔴 Crítico: 2 horas

🟡 Alto: 24 horas

🟢 Normal: 48 horas

📄 Licença
Este projeto está licenciado sob a Licença MIT - veja o arquivo LICENSE para detalhes.

📋 Termos da Licença MIT
text
Copyright (c) 2025 ETEC de Itaquaquecetuba - Técnico em Informática

Permissão é concedida, gratuitamente, a qualquer pessoa que obtenha uma cópia
deste software e dos arquivos de documentação associados (o "Software"), para lidar
no Software sem restrição, incluindo, sem limitação, os direitos de usar, copiar,
modificar, mesclar, publicar, distribuir, sublicenciar e/ou vender cópias do Software,
e permitir que as pessoas a quem o Software é fornecido o façam, sujeitas às
seguintes condições:

O aviso de copyright acima e este aviso de permissão devem ser incluídos em todas
as cópias ou partes substanciais do Software.

O SOFTWARE É FORNECIDO "COMO ESTÁ", SEM GARANTIA DE QUALQUER TIPO, EXPRESSA OU
IMPLÍCITA, INCLUINDO, MAS NÃO SE LIMITANDO ÀS GARANTIAS DE COMERCIALIZAÇÃO,
ADEQUAÇÃO A UM DETERMINADO FIM E NÃO VIOLAÇÃO. EM NENHUM CASO OS AUTORES OU
DETENTORES DE DIREITOS AUTORAIS SERÃO RESPONSÁVEIS POR QUALQUER REIVINDICAÇÃO,
DANOS OU OUTRA RESPONSABILIDADE, SEJA EM AÇÃO DE CONTRATO, DELITO OU OUTRA FORMA,
DECORRENTE DE, FORA DE OU EM CONEXÃO COM O SOFTWARE OU O USO OU OUTRAS NEGOCIAÇÕES
NO SOFTWARE.
📚 Recursos Adicionais
Documentação
Documentação da API

Guia do Usuário

Manual de Instalação

Referências
Spring Boot Documentation

MySQL Documentation

JWT.io

Docker Documentation

<div align="center">
🌟 "Alimento não se joga fora, se compartilha."
Prato Justo - Conectando pessoas, combatendo o desperdício, alimentando esperanças.

Reportar Bug ·
Solicitar Feature ·
Contribuir

*Projeto desenvolvido com ❤️ pelos alunos do Técnico em Informática da ETEC de Itaquaquecetuba - 2025*

</div>
