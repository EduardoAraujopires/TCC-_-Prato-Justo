package com.TCC.Prato_Justo.Controller;

import com.TCC.Prato_Justo.Interface.AnthUsuarioRepository;
import com.TCC.Prato_Justo.Interface.MensagemRepository;
import com.TCC.Prato_Justo.Model.Mensagem;
import com.TCC.Prato_Justo.Model.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.Optional;

@Controller
public class ChatWebSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private MensagemRepository mensagemRepository;

    @Autowired
    private AnthUsuarioRepository usuarioRepository;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessage message) {
        try {
            // Obter usuário autenticado do contexto de segurança
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return; // Não autenticado, ignorar mensagem
            }

            // Obter usuário - se for UserPrincipal, usar getUsername(), senão usar getName()
            Usuario remetente = null;
            if (auth.getPrincipal() instanceof com.TCC.Prato_Justo.Config.UserPrincipal) {
                com.TCC.Prato_Justo.Config.UserPrincipal principal = 
                    (com.TCC.Prato_Justo.Config.UserPrincipal) auth.getPrincipal();
                Optional<Usuario> remetenteOpt = usuarioRepository.findById(principal.getUserId());
                if (remetenteOpt.isPresent()) {
                    remetente = remetenteOpt.get();
                }
            } else {
                // Fallback: buscar por email
                String email = auth.getName();
                Optional<Usuario> remetenteOpt = usuarioRepository.findByEmail(email);
                if (remetenteOpt.isPresent()) {
                    remetente = remetenteOpt.get();
                }
            }

            if (remetente == null) {
                return; // Usuário não encontrado
            }

            // Obter destinatário do ID na mensagem
            Long destinatarioId = message.getDestinatarioId();
            if (destinatarioId == null) {
                return; // Destinatário não especificado
            }

            Optional<Usuario> destOpt = usuarioRepository.findById(destinatarioId);
            if (destOpt.isEmpty()) {
                return; // Destinatário não encontrado
            }
            Usuario destinatario = destOpt.get();

            // Criar e salvar mensagem no banco de dados
            Mensagem mensagem = new Mensagem();
            mensagem.setRemetente(remetente);
            mensagem.setDestinatario(destinatario);
            mensagem.setConteudo(message.getContent());
            mensagem.setCriadoEm(LocalDateTime.now());
            mensagem.setLido(false);

            Mensagem saved = mensagemRepository.save(mensagem);

            // Criar mensagem de resposta para WebSocket
            ChatMessageResponse response = new ChatMessageResponse();
            response.setId(saved.getId());
            response.setRemetenteId(remetente.getId());
            response.setRemetenteNome(remetente.getNome());
            response.setContent(saved.getConteudo());
            response.setTimestamp(saved.getCriadoEm());
            response.setType("CHAT");

            // Enviar mensagem para o destinatário específico via tópico privado
            messagingTemplate.convertAndSendToUser(
                destinatarioId.toString(),
                "/queue/messages",
                response
            );

            // Também enviar de volta para o remetente (para confirmação de envio)
            messagingTemplate.convertAndSendToUser(
                remetente.getId().toString(),
                "/queue/messages",
                response
            );

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // Classe para receber mensagem do cliente
    public static class ChatMessage {
        private Long destinatarioId;
        private String content;
        private String type;

        public Long getDestinatarioId() {
            return destinatarioId;
        }

        public void setDestinatarioId(Long destinatarioId) {
            this.destinatarioId = destinatarioId;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }
    }

    // Classe para enviar resposta ao cliente
    public static class ChatMessageResponse {
        private Long id;
        private Long remetenteId;
        private String remetenteNome;
        private String content;
        private LocalDateTime timestamp;
        private String type;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public Long getRemetenteId() {
            return remetenteId;
        }

        public void setRemetenteId(Long remetenteId) {
            this.remetenteId = remetenteId;
        }

        public String getRemetenteNome() {
            return remetenteNome;
        }

        public void setRemetenteNome(String remetenteNome) {
            this.remetenteNome = remetenteNome;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }

        public LocalDateTime getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }
    }
}

