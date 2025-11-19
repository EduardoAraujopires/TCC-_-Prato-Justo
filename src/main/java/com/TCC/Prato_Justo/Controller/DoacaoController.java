package com.TCC.Prato_Justo.Controller;

import com.TCC.Prato_Justo.Model.Doacao;
import com.TCC.Prato_Justo.Model.Usuario;
import com.TCC.Prato_Justo.Service.AuthService;
import com.TCC.Prato_Justo.Service.DoacaoService;
import com.TCC.Prato_Justo.Service.FileUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/doacoes")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class DoacaoController {

    private final DoacaoService doacaoService;
    
    @Autowired
    private AuthService authService;

    @Autowired
    private FileUploadService fileUploadService;

    @Autowired
    private com.TCC.Prato_Justo.Service.SolicitacaoService solicitacaoService;

    public DoacaoController(DoacaoService doacaoService) {
        this.doacaoService = doacaoService;
    }

    public static class CriarDoacaoRequest {
        public Long doadorId; // opcional
        public Long estabelecimentoDestinoId; // opcional
        public String titulo;
        public String descricao;
        public String tipoAlimento;
        public Double quantidade;
        public String cidade;
        public String endereco;
        public Double latitude;
        public Double longitude;
    }

    @PostMapping
    public ResponseEntity<?> criar(@RequestBody Doacao dto, 
                                   @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            System.out.println("=== RECEBENDO DOAÇÃO ===");
            System.out.println("Título: " + dto.getTitulo());
            System.out.println("Tipo: " + dto.getTipoAlimento());
            System.out.println("Cidade: " + dto.getCidade());
            System.out.println("Endereço: " + dto.getEndereco());
            System.out.println("Data Validade: " + dto.getDataValidade());
            System.out.println("Data Coleta: " + dto.getDataColeta());
            System.out.println("Imagem: " + dto.getImagem());
            System.out.println("Lat: " + dto.getLatitude());
            System.out.println("Lng: " + dto.getLongitude());
            
            // Validar campos obrigatórios
            if (dto.getTitulo() == null || dto.getTitulo().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Título é obrigatório");
            }
            if (dto.getCidade() == null || dto.getCidade().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Cidade é obrigatória");
            }
            if (dto.getEndereco() == null || dto.getEndereco().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Endereço é obrigatório");
            }
            
            // Validar datas
            LocalDate hoje = LocalDate.now();
            
            if (dto.getDataValidade() != null) {
                // Data de validade deve ser posterior a hoje
                if (!dto.getDataValidade().isAfter(hoje)) {
                    return ResponseEntity.badRequest().body("A data de validade deve ser posterior a hoje");
                }
            }
            
            if (dto.getDataColeta() != null) {
                // Data de coleta deve ser hoje ou posterior
                if (dto.getDataColeta().isBefore(hoje)) {
                    return ResponseEntity.badRequest().body("A data de coleta não pode ser anterior a hoje");
                }
            }
            
            // Validar que data de validade é posterior à data de coleta
            if (dto.getDataValidade() != null && dto.getDataColeta() != null) {
                if (!dto.getDataValidade().isAfter(dto.getDataColeta())) {
                    return ResponseEntity.badRequest().body("A data de validade deve ser posterior à data de coleta");
                }
            }
            
            // Obter usuário logado se token fornecido
            Usuario doador = null;
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                if (authService.isTokenValid(token)) {
                    doador = authService.getCurrentUser(token);
                }
            }
            
            Doacao criada = doacaoService.criar(dto, doador);
            System.out.println("Doação criada com ID: " + criada.getId());
            return ResponseEntity.ok(criada);
        } catch (Exception ex) {
            System.err.println("ERRO DETALHADO:");
            ex.printStackTrace();
            return ResponseEntity.status(500).body("Erro interno: " + ex.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Doacao>> listar(@RequestParam(required = false) String tipo,
                                               @RequestParam(required = false) String cidade) {
        return ResponseEntity.ok(doacaoService.listarAtivas(tipo, cidade));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Doacao> obter(@PathVariable Long id) {
        Optional<Doacao> d = doacaoService.obter(id);
        return d.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, 
                                      @RequestBody Doacao dto,
                                      @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Verificar se o token foi fornecido
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Token não fornecido. É necessário estar autenticado para editar uma doação.");
            }

            String token = authHeader.substring(7);
            if (!authService.isTokenValid(token)) {
                return ResponseEntity.status(401).body("Token inválido ou expirado.");
            }

            Usuario usuario = authService.getCurrentUser(token);
            if (usuario == null) {
                return ResponseEntity.status(404).body("Usuário não encontrado.");
            }

            // Verificar se a doação existe
            Optional<Doacao> doacaoOptional = doacaoService.obter(id);
            if (doacaoOptional.isEmpty()) {
                return ResponseEntity.status(404).body("Doação não encontrada.");
            }

            Doacao doacao = doacaoOptional.get();

            // Verificar se o usuário logado é o dono da doação
            if (doacao.getDoador() == null || !doacao.getDoador().getId().equals(usuario.getId())) {
                return ResponseEntity.status(403).body("Você não tem permissão para editar esta doação. Apenas o criador pode editá-la.");
            }

            // Verificar se há solicitações concluídas para esta doação
            List<com.TCC.Prato_Justo.Model.Solicitacao> solicitacoes = solicitacaoService.listarPorDoacao(id);
            boolean temSolicitacaoConcluida = solicitacoes.stream()
                .anyMatch(s -> s.getStatus() == com.TCC.Prato_Justo.Model.StatusSolicitacao.CONCLUIDA);
            
            // Se houver solicitação concluída, não permitir reativar a doação
            if (temSolicitacaoConcluida && dto.getAtivo() != null && dto.getAtivo()) {
                return ResponseEntity.status(400).body("Não é possível reativar uma doação que já foi concluída. A doação permanecerá inativa.");
            }
            
            // Se houver solicitação concluída, garantir que a doação permaneça inativa
            if (temSolicitacaoConcluida) {
                dto.setAtivo(false);
            }

            // Deletar imagem antiga se uma nova imagem foi fornecida
            if (dto.getImagem() != null && !dto.getImagem().equals(doacao.getImagem()) && doacao.getImagem() != null) {
                fileUploadService.deleteFoodImage(doacao.getImagem());
            }

            // Validar campos obrigatórios
            if (dto.getTitulo() == null || dto.getTitulo().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Título é obrigatório");
            }
            if (dto.getCidade() == null || dto.getCidade().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Cidade é obrigatória");
            }
            if (dto.getEndereco() == null || dto.getEndereco().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Endereço é obrigatório");
            }

            // Validar datas
            LocalDate hoje = LocalDate.now();
            
            if (dto.getDataValidade() != null) {
                if (!dto.getDataValidade().isAfter(hoje)) {
                    return ResponseEntity.badRequest().body("A data de validade deve ser posterior a hoje");
                }
            }
            
            if (dto.getDataColeta() != null) {
                if (dto.getDataColeta().isBefore(hoje)) {
                    return ResponseEntity.badRequest().body("A data de coleta não pode ser anterior a hoje");
                }
            }
            
            if (dto.getDataValidade() != null && dto.getDataColeta() != null) {
                if (!dto.getDataValidade().isAfter(dto.getDataColeta())) {
                    return ResponseEntity.badRequest().body("A data de validade deve ser posterior à data de coleta");
                }
            }

            // Atualizar a doação
            Doacao atualizada = doacaoService.atualizar(id, dto);
            return ResponseEntity.ok(atualizada);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            System.err.println("Erro ao atualizar doação: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erro interno: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        doacaoService.remover(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/proximas")
    public ResponseEntity<List<Doacao>> proximas(@RequestParam(required = false) Double lat,
                                                 @RequestParam(required = false) Double lng,
                                                 @RequestParam(required = false, name = "raio_km") Double raioKm) {
        return ResponseEntity.ok(doacaoService.proximas(lat, lng, raioKm));
    }

    @GetMapping("/minhas")
    public ResponseEntity<?> minhasDoacoes(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Token não fornecido");
            }

            String token = authHeader.substring(7);
            if (!authService.isTokenValid(token)) {
                return ResponseEntity.status(401).body("Token inválido");
            }

            Usuario usuario = authService.getCurrentUser(token);
            if (usuario == null) {
                return ResponseEntity.status(404).body("Usuário não encontrado");
            }

            List<Doacao> doacoes = doacaoService.listarPorDoador(usuario.getId());
            return ResponseEntity.ok(doacoes);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro interno: " + e.getMessage());
        }
    }

    @PostMapping("/upload-image")
    public ResponseEntity<?> uploadFoodImage(
            @RequestParam("image") MultipartFile file,
            @RequestParam(value = "doacaoId", required = false) Long doacaoId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            System.out.println("=== RECEBENDO UPLOAD DE IMAGEM DE ALIMENTO ===");
            System.out.println("Nome do arquivo: " + file.getOriginalFilename());
            System.out.println("Tamanho: " + file.getSize() + " bytes");
            System.out.println("Tipo: " + file.getContentType());
            System.out.println("Doação ID: " + doacaoId);

            // Validar token (opcional, mas recomendado)
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                if (!authService.isTokenValid(token)) {
                    return ResponseEntity.status(401).body("Token inválido");
                }
                
                // Se doacaoId fornecido, verificar se o usuário é o dono
                if (doacaoId != null) {
                    Usuario usuario = authService.getCurrentUser(token);
                    Optional<Doacao> doacaoOptional = doacaoService.obter(doacaoId);
                    if (doacaoOptional.isPresent()) {
                        Doacao doacao = doacaoOptional.get();
                        if (doacao.getDoador() == null || !doacao.getDoador().getId().equals(usuario.getId())) {
                            return ResponseEntity.status(403).body("Você não tem permissão para editar esta doação");
                        }
                        // Deletar imagem antiga
                        if (doacao.getImagem() != null) {
                            fileUploadService.deleteFoodImage(doacao.getImagem());
                        }
                    }
                }
            }

            // Salvar a imagem
            String imageUrl = fileUploadService.saveFoodImage(file, doacaoId);
            
            System.out.println("✅ Imagem salva em: " + imageUrl);

            // Retornar a URL da imagem
            Map<String, String> response = new HashMap<>();
            response.put("imageUrl", imageUrl);
            response.put("message", "Imagem enviada com sucesso");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Erro ao fazer upload da imagem: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @PostMapping("/{id}/solicitar")
    public ResponseEntity<?> solicitarDoacao(@PathVariable Long id,
                                             @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Validar autenticação
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Token não fornecido. É necessário estar autenticado para solicitar uma doação.");
                error.put("error", "Token não fornecido. É necessário estar autenticado para solicitar uma doação.");
                return ResponseEntity.status(401).body(error);
            }

            String token = authHeader.substring(7);
            if (!authService.isTokenValid(token)) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Token inválido ou expirado.");
                error.put("error", "Token inválido ou expirado.");
                return ResponseEntity.status(401).body(error);
            }

            Usuario solicitante = authService.getCurrentUser(token);
            if (solicitante == null) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Usuário não encontrado.");
                error.put("error", "Usuário não encontrado.");
                return ResponseEntity.status(404).body(error);
            }

            // Verificar se a doação existe
            Optional<Doacao> doacaoOptional = doacaoService.obter(id);
            if (doacaoOptional.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Doação não encontrada.");
                error.put("error", "Doação não encontrada.");
                return ResponseEntity.status(404).body(error);
            }

            Doacao doacao = doacaoOptional.get();

            // Verificar se a doação está ativa
            if (!doacao.getAtivo()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Esta doação não está mais disponível.");
                error.put("error", "Esta doação não está mais disponível.");
                return ResponseEntity.badRequest().body(error);
            }

            // Verificar se o usuário não é o dono da doação
            if (doacao.getDoador() != null && doacao.getDoador().getId().equals(solicitante.getId())) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Você não pode solicitar sua própria doação.");
                error.put("error", "Você não pode solicitar sua própria doação.");
                return ResponseEntity.badRequest().body(error);
            }

            // Criar solicitação
            com.TCC.Prato_Justo.Model.Solicitacao solicitacao = solicitacaoService.criar(doacao, solicitante);
            
            // Notificar doador sobre nova solicitação (será feito no frontend via realtime-manager)
            // O frontend escutará o evento quando a solicitação for criada
            
            // Retornar resposta formatada para o frontend
            Map<String, Object> response = new HashMap<>();
            response.put("id", solicitacao.getId());
            response.put("doacao", doacao);
            response.put("status", solicitacao.getStatus().getValor());
            response.put("dataSolicitacao", solicitacao.getDataSolicitacao());
            response.put("solicitante", solicitacao.getSolicitante());
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            System.err.println("Erro ao solicitar doação: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("message", "Erro interno: " + e.getMessage());
            error.put("error", "Erro interno: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/minhas-solicitacoes")
    public ResponseEntity<?> minhasSolicitacoes(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Token não fornecido");
            }

            String token = authHeader.substring(7);
            if (!authService.isTokenValid(token)) {
                return ResponseEntity.status(401).body("Token inválido");
            }

            Usuario usuario = authService.getCurrentUser(token);
            if (usuario == null) {
                return ResponseEntity.status(404).body("Usuário não encontrado");
            }

            List<com.TCC.Prato_Justo.Model.Solicitacao> solicitacoes = solicitacaoService.listarPorSolicitante(usuario.getId());
            
            // Formatar resposta para o frontend
            List<Map<String, Object>> response = solicitacoes.stream().map(s -> {
                Map<String, Object> item = new HashMap<>();
                item.put("id", s.getId());
                item.put("doacao", s.getDoacao());
                item.put("status", s.getStatus().getValor());
                item.put("dataSolicitacao", s.getDataSolicitacao());
                return item;
            }).collect(java.util.stream.Collectors.toList());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro interno: " + e.getMessage());
        }
    }

    @GetMapping("/solicitacoes/{id}")
    public ResponseEntity<?> obterSolicitacao(@PathVariable Long id,
                                                @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Token não fornecido");
            }

            String token = authHeader.substring(7);
            if (!authService.isTokenValid(token)) {
                return ResponseEntity.status(401).body("Token inválido");
            }

            Usuario usuario = authService.getCurrentUser(token);
            if (usuario == null) {
                return ResponseEntity.status(404).body("Usuário não encontrado");
            }

            Optional<com.TCC.Prato_Justo.Model.Solicitacao> solicitacaoOpt = solicitacaoService.obter(id);
            if (solicitacaoOpt.isEmpty()) {
                return ResponseEntity.status(404).body("Solicitação não encontrada");
            }

            com.TCC.Prato_Justo.Model.Solicitacao solicitacao = solicitacaoOpt.get();
            
            // Verificar se o usuário tem permissão (doador ou solicitante)
            boolean isDoador = solicitacao.getDoacao().getDoador() != null && 
                              solicitacao.getDoacao().getDoador().getId().equals(usuario.getId());
            boolean isSolicitante = solicitacao.getSolicitante().getId().equals(usuario.getId());
            
            if (!isDoador && !isSolicitante) {
                return ResponseEntity.status(403).body("Você não tem permissão para ver esta solicitação");
            }

            Map<String, Object> response = new HashMap<>();
            response.put("id", solicitacao.getId());
            response.put("doacao", solicitacao.getDoacao());
            response.put("solicitante", solicitacao.getSolicitante());
            response.put("status", solicitacao.getStatus().getValor());
            response.put("dataSolicitacao", solicitacao.getDataSolicitacao());
            response.put("dataAtualizacao", solicitacao.getDataAtualizacao());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro interno: " + e.getMessage());
        }
    }

    @PostMapping("/solicitacoes/{id}/cancelar")
    public ResponseEntity<?> cancelarSolicitacao(@PathVariable Long id,
                                                  @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Token não fornecido");
            }

            String token = authHeader.substring(7);
            if (!authService.isTokenValid(token)) {
                return ResponseEntity.status(401).body("Token inválido");
            }

            Usuario usuario = authService.getCurrentUser(token);
            if (usuario == null) {
                return ResponseEntity.status(404).body("Usuário não encontrado");
            }

            // Verificar se a solicitação pertence ao usuário
            Optional<com.TCC.Prato_Justo.Model.Solicitacao> solicitacaoOpt = solicitacaoService.obter(id);
            if (solicitacaoOpt.isEmpty()) {
                return ResponseEntity.status(404).body("Solicitação não encontrada");
            }

            com.TCC.Prato_Justo.Model.Solicitacao solicitacao = solicitacaoOpt.get();
            
            // Verificar se o usuário é o solicitante OU o doador da doação
            boolean isSolicitante = solicitacao.getSolicitante() != null && 
                                    solicitacao.getSolicitante().getId().equals(usuario.getId());
            
            boolean isDoador = false;
            if (solicitacao.getDoacao() != null && solicitacao.getDoacao().getDoador() != null) {
                Long doadorId = solicitacao.getDoacao().getDoador().getId();
                isDoador = doadorId != null && doadorId.equals(usuario.getId());
            }
            
            if (!isSolicitante && !isDoador) {
                return ResponseEntity.status(403).body("Você não tem permissão para cancelar esta solicitação");
            }

            solicitacaoService.cancelar(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro interno: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/solicitacoes")
    public ResponseEntity<?> listarSolicitacoesDaDoacao(@PathVariable Long id,
                                                          @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Token não fornecido");
            }

            String token = authHeader.substring(7);
            if (!authService.isTokenValid(token)) {
                return ResponseEntity.status(401).body("Token inválido");
            }

            Usuario usuario = authService.getCurrentUser(token);
            if (usuario == null) {
                return ResponseEntity.status(404).body("Usuário não encontrado");
            }

            // Verificar se a doação existe e se o usuário é o dono
            Optional<Doacao> doacaoOpt = doacaoService.obter(id);
            if (doacaoOpt.isEmpty()) {
                return ResponseEntity.status(404).body("Doação não encontrada");
            }

            Doacao doacao = doacaoOpt.get();
            if (doacao.getDoador() == null || !doacao.getDoador().getId().equals(usuario.getId())) {
                return ResponseEntity.status(403).body("Você não tem permissão para ver as solicitações desta doação");
            }

            List<com.TCC.Prato_Justo.Model.Solicitacao> solicitacoes = solicitacaoService.listarPorDoacao(id);
            
            // Formatar resposta para o frontend
            List<Map<String, Object>> response = solicitacoes.stream().map(s -> {
                Map<String, Object> item = new HashMap<>();
                item.put("id", s.getId());
                item.put("solicitante", s.getSolicitante());
                item.put("status", s.getStatus().getValor());
                item.put("dataSolicitacao", s.getDataSolicitacao());
                item.put("dataAtualizacao", s.getDataAtualizacao());
                return item;
            }).collect(java.util.stream.Collectors.toList());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro interno: " + e.getMessage());
        }
    }

    @PostMapping("/solicitacoes/{id}/aceitar")
    public ResponseEntity<?> aceitarSolicitacao(@PathVariable Long id,
                                                @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Token não fornecido");
            }

            String token = authHeader.substring(7);
            if (!authService.isTokenValid(token)) {
                return ResponseEntity.status(401).body("Token inválido");
            }

            Usuario usuario = authService.getCurrentUser(token);
            if (usuario == null) {
                return ResponseEntity.status(404).body("Usuário não encontrado");
            }

            com.TCC.Prato_Justo.Model.Solicitacao solicitacao = solicitacaoService.aceitar(id, usuario.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", solicitacao.getId());
            response.put("status", solicitacao.getStatus().getValor());
            response.put("doacao", solicitacao.getDoacao());
            response.put("solicitante", solicitacao.getSolicitante());
            response.put("message", "Solicitação aceita com sucesso");
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro interno: " + e.getMessage());
        }
    }

    @PostMapping("/solicitacoes/{id}/recusar")
    public ResponseEntity<?> recusarSolicitacao(@PathVariable Long id,
                                                 @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Token não fornecido");
            }

            String token = authHeader.substring(7);
            if (!authService.isTokenValid(token)) {
                return ResponseEntity.status(401).body("Token inválido");
            }

            Usuario usuario = authService.getCurrentUser(token);
            if (usuario == null) {
                return ResponseEntity.status(404).body("Usuário não encontrado");
            }

            com.TCC.Prato_Justo.Model.Solicitacao solicitacao = solicitacaoService.recusar(id, usuario.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", solicitacao.getId());
            response.put("status", solicitacao.getStatus().getValor());
            response.put("message", "Solicitação recusada");
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro interno: " + e.getMessage());
        }
    }

    @PostMapping("/solicitacoes/{id}/marcar-coletada")
    public ResponseEntity<?> marcarColetada(@PathVariable Long id,
                                             @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Token não fornecido");
            }

            String token = authHeader.substring(7);
            if (!authService.isTokenValid(token)) {
                return ResponseEntity.status(401).body("Token inválido");
            }

            Usuario usuario = authService.getCurrentUser(token);
            if (usuario == null) {
                return ResponseEntity.status(404).body("Usuário não encontrado");
            }

            com.TCC.Prato_Justo.Model.Solicitacao solicitacao = solicitacaoService.marcarColetada(id, usuario.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", solicitacao.getId());
            response.put("status", solicitacao.getStatus().getValor());
            response.put("message", "Solicitação marcada como coletada/entregue");
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro interno: " + e.getMessage());
        }
    }
}


