package com.TCC.Prato_Justo.Service;

import com.TCC.Prato_Justo.Interface.AvaliacaoSolicitacaoRepository;
import com.TCC.Prato_Justo.Model.AvaliacaoSolicitacao;
import com.TCC.Prato_Justo.Model.Solicitacao;
import com.TCC.Prato_Justo.Model.StatusSolicitacao;
import com.TCC.Prato_Justo.Model.Usuario;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AvaliacaoSolicitacaoService {

    private final AvaliacaoSolicitacaoRepository avaliacaoRepository;

    public AvaliacaoSolicitacaoService(AvaliacaoSolicitacaoRepository avaliacaoRepository) {
        this.avaliacaoRepository = avaliacaoRepository;
    }

    public AvaliacaoSolicitacao criar(Long solicitacaoId, Long avaliadorId, Long avaliadoId, Integer nota, String comentario) {
        // Validar nota
        if (nota == null || nota < 1 || nota > 5) {
            throw new IllegalArgumentException("Nota deve ser entre 1 e 5");
        }

        // Verificar se já existe avaliação do avaliador para esta solicitação
        Optional<AvaliacaoSolicitacao> existente = avaliacaoRepository.findBySolicitacaoIdAndAvaliadorId(solicitacaoId, avaliadorId);
        if (existente.isPresent()) {
            throw new IllegalArgumentException("Você já avaliou esta solicitação");
        }

        AvaliacaoSolicitacao avaliacao = new AvaliacaoSolicitacao();
        
        Solicitacao solicitacao = new Solicitacao();
        solicitacao.setId(solicitacaoId);
        avaliacao.setSolicitacao(solicitacao);
        
        Usuario avaliador = new Usuario();
        avaliador.setId(avaliadorId);
        avaliacao.setAvaliador(avaliador);
        
        Usuario avaliado = new Usuario();
        avaliado.setId(avaliadoId);
        avaliacao.setAvaliado(avaliado);
        
        avaliacao.setNota(nota);
        avaliacao.setComentario(comentario);
        
        return avaliacaoRepository.save(avaliacao);
    }

    public List<AvaliacaoSolicitacao> listarPorSolicitacao(Long solicitacaoId) {
        return avaliacaoRepository.findBySolicitacaoId(solicitacaoId);
    }

    public List<AvaliacaoSolicitacao> listarPorAvaliado(Long usuarioId) {
        return avaliacaoRepository.findByAvaliadoId(usuarioId);
    }

    public List<AvaliacaoSolicitacao> listarPorAvaliador(Long usuarioId) {
        return avaliacaoRepository.findByAvaliadorId(usuarioId);
    }

    public Double mediaPorAvaliado(Long usuarioId) {
        Double media = avaliacaoRepository.mediaPorAvaliadoId(usuarioId);
        return media != null ? media : 0.0;
    }

    public Long contarPorAvaliado(Long usuarioId) {
        return avaliacaoRepository.countByAvaliadoId(usuarioId);
    }
}

