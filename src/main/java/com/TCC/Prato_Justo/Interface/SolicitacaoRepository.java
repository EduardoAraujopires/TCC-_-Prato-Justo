package com.TCC.Prato_Justo.Interface;

import com.TCC.Prato_Justo.Model.Solicitacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SolicitacaoRepository extends JpaRepository<Solicitacao, Long> {
    
    List<Solicitacao> findBySolicitanteId(Long solicitanteId);
    
    List<Solicitacao> findByDoacaoId(Long doacaoId);
    
    @Query("SELECT s FROM Solicitacao s WHERE s.solicitante.id = :solicitanteId AND s.status = :status")
    List<Solicitacao> findBySolicitanteIdAndStatus(@Param("solicitanteId") Long solicitanteId, 
                                                     @Param("status") com.TCC.Prato_Justo.Model.StatusSolicitacao status);
    
    @Query("SELECT s FROM Solicitacao s WHERE s.doacao.id = :doacaoId AND s.solicitante.id = :solicitanteId")
    Optional<Solicitacao> findByDoacaoIdAndSolicitanteId(@Param("doacaoId") Long doacaoId, 
                                                          @Param("solicitanteId") Long solicitanteId);
    
    @Query("SELECT s FROM Solicitacao s WHERE s.doacao.doador.id = :doadorId")
    List<Solicitacao> findByDoacaoDoadorId(@Param("doadorId") Long doadorId);
}

