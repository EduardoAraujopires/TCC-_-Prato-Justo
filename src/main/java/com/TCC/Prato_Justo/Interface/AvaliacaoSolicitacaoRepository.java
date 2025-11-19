package com.TCC.Prato_Justo.Interface;

import com.TCC.Prato_Justo.Model.AvaliacaoSolicitacao;
import com.TCC.Prato_Justo.Model.Solicitacao;
import com.TCC.Prato_Justo.Model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AvaliacaoSolicitacaoRepository extends JpaRepository<AvaliacaoSolicitacao, Long> {
    
    List<AvaliacaoSolicitacao> findBySolicitacao(Solicitacao solicitacao);
    
    List<AvaliacaoSolicitacao> findByAvaliado(Usuario avaliado);
    
    @Query("SELECT a FROM AvaliacaoSolicitacao a WHERE a.solicitacao.id = :solicitacaoId")
    List<AvaliacaoSolicitacao> findBySolicitacaoId(@Param("solicitacaoId") Long solicitacaoId);
    
    @Query("SELECT a FROM AvaliacaoSolicitacao a WHERE a.avaliado.id = :usuarioId")
    List<AvaliacaoSolicitacao> findByAvaliadoId(@Param("usuarioId") Long usuarioId);
    
    @Query("SELECT a FROM AvaliacaoSolicitacao a WHERE a.avaliador.id = :usuarioId")
    List<AvaliacaoSolicitacao> findByAvaliadorId(@Param("usuarioId") Long usuarioId);
    
    @Query("SELECT a FROM AvaliacaoSolicitacao a WHERE a.solicitacao.id = :solicitacaoId AND a.avaliador.id = :avaliadorId")
    Optional<AvaliacaoSolicitacao> findBySolicitacaoIdAndAvaliadorId(@Param("solicitacaoId") Long solicitacaoId, 
                                                                      @Param("avaliadorId") Long avaliadorId);
    
    @Query("SELECT AVG(a.nota) FROM AvaliacaoSolicitacao a WHERE a.avaliado.id = :usuarioId")
    Double mediaPorAvaliadoId(@Param("usuarioId") Long usuarioId);
    
    @Query("SELECT COUNT(a) FROM AvaliacaoSolicitacao a WHERE a.avaliado.id = :usuarioId")
    Long countByAvaliadoId(@Param("usuarioId") Long usuarioId);
}

