package com.TCC.Prato_Justo.Interface;

import com.TCC.Prato_Justo.Model.Chat;
import com.TCC.Prato_Justo.Model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatRepository extends JpaRepository<Chat, Long> {

    // Buscar chat por token
    Optional<Chat> findByToken(String token);

    // Buscar chats onde o usuário é participante (usuario1 ou usuario2)
    @Query("SELECT c FROM Chat c WHERE (c.usuario1 = :usuario OR c.usuario2 = :usuario) AND c.ativo = true ORDER BY c.criadoEm DESC")
    List<Chat> findByUsuario(@Param("usuario") Usuario usuario);

    // Buscar chat entre dois usuários específicos
    @Query("SELECT c FROM Chat c WHERE " +
           "((c.usuario1 = :usuario1 AND c.usuario2 = :usuario2) OR " +
           "(c.usuario1 = :usuario2 AND c.usuario2 = :usuario1)) AND c.ativo = true")
    Optional<Chat> findChatEntreUsuarios(@Param("usuario1") Usuario usuario1, @Param("usuario2") Usuario usuario2);

    // Buscar chat por solicitação
    Optional<Chat> findBySolicitacaoId(Long solicitacaoId);
}

