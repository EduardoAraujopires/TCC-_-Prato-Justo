package com.TCC.Prato_Justo.Controller;

import com.TCC.Prato_Justo.Model.AvaliacaoSolicitacao;
import com.TCC.Prato_Justo.Model.Solicitacao;
import com.TCC.Prato_Justo.Model.Usuario;
import com.TCC.Prato_Justo.Service.AuthService;
import com.TCC.Prato_Justo.Service.AvaliacaoSolicitacaoService;
import com.TCC.Prato_Justo.Service.SolicitacaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/avaliacoes-solicitacao")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS})
public class AvaliacaoSolicitacaoController {

    private final AvaliacaoSolicitacaoService avaliacaoService;
    
    @Autowired
    private AuthService authService;
    
    @Autowired
    private SolicitacaoService solicitacaoService;

    public AvaliacaoSolicitacaoController(AvaliacaoSolicitacaoService avaliacaoService) {
        this.avaliacaoService = avaliacaoService;
    }

    public static class CriarAvaliacaoRequest {
        public Long solicitacaoId;
        public Long avaliadoId;
        public Integer nota;
        public String comentario;
    }

    @PostMapping
    public ResponseEntity<?> criar(@RequestBody CriarAvaliacaoRequest request,
                                   @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Token não fornecido");
            }

            String token = authHeader.substring(7);
            if (!authService.isTokenValid(token)) {
                return ResponseEntity.status(401).body("Token inválido");
            }

            Usuario avaliador = authService.getCurrentUser(token);
            if (avaliador == null) {
                return ResponseEntity.status(404).body("Usuário não encontrado");
            }

            // Verificar se a solicitação existe e se o avaliador tem permissão
            Optional<Solicitacao> solicitacaoOpt = solicitacaoService.obter(request.solicitacaoId);
            if (solicitacaoOpt.isEmpty()) {
                return ResponseEntity.status(404).body("Solicitação não encontrada");
            }

            Solicitacao solicitacao = solicitacaoOpt.get();
            
            // Verificar se a solicitação está concluída
            if (solicitacao.getStatus() != com.TCC.Prato_Justo.Model.StatusSolicitacao.CONCLUIDA) {
                return ResponseEntity.status(400).body("Apenas solicitações concluídas podem ser avaliadas");
            }

            // Verificar se o avaliador é o doador ou o solicitante
            boolean isDoador = solicitacao.getDoacao().getDoador() != null && 
                              solicitacao.getDoacao().getDoador().getId().equals(avaliador.getId());
            boolean isSolicitante = solicitacao.getSolicitante().getId().equals(avaliador.getId());

            if (!isDoador && !isSolicitante) {
                return ResponseEntity.status(403).body("Você não tem permissão para avaliar esta solicitação");
            }

            // Verificar se o avaliado é o outro participante
            boolean avaliadoIsDoador = solicitacao.getDoacao().getDoador() != null && 
                                       solicitacao.getDoacao().getDoador().getId().equals(request.avaliadoId);
            boolean avaliadoIsSolicitante = solicitacao.getSolicitante().getId().equals(request.avaliadoId);

            if (!avaliadoIsDoador && !avaliadoIsSolicitante) {
                return ResponseEntity.status(400).body("O usuário avaliado deve ser o doador ou o solicitante da solicitação");
            }

            // Verificar se não está tentando se auto-avaliar
            if (request.avaliadoId.equals(avaliador.getId())) {
                return ResponseEntity.status(400).body("Você não pode se auto-avaliar");
            }

            AvaliacaoSolicitacao avaliacao = avaliacaoService.criar(
                request.solicitacaoId,
                avaliador.getId(),
                request.avaliadoId,
                request.nota,
                request.comentario
            );

            return ResponseEntity.ok(avaliacao);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro interno: " + e.getMessage());
        }
    }

    @GetMapping("/solicitacao/{id}")
    public ResponseEntity<?> listarPorSolicitacao(@PathVariable Long id) {
        try {
            List<AvaliacaoSolicitacao> avaliacoes = avaliacaoService.listarPorSolicitacao(id);
            return ResponseEntity.ok(avaliacoes);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro interno: " + e.getMessage());
        }
    }

    @GetMapping("/usuario/{id}")
    public ResponseEntity<?> listarPorAvaliado(@PathVariable Long id) {
        try {
            List<AvaliacaoSolicitacao> avaliacoes = avaliacaoService.listarPorAvaliado(id);
            return ResponseEntity.ok(avaliacoes);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro interno: " + e.getMessage());
        }
    }

    @GetMapping("/usuario/{id}/media")
    public ResponseEntity<?> mediaPorAvaliado(@PathVariable Long id) {
        try {
            Double media = avaliacaoService.mediaPorAvaliado(id);
            Long total = avaliacaoService.contarPorAvaliado(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("media", media);
            response.put("total", total);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro interno: " + e.getMessage());
        }
    }
}

