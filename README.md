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
