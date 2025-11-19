package com.TCC.Prato_Justo.Controller;

import com.TCC.Prato_Justo.Interface.AnthUsuarioRepository;
import com.TCC.Prato_Justo.Interface.MensagemRepository;
import com.TCC.Prato_Justo.Model.Chat;
import com.TCC.Prato_Justo.Model.Mensagem;
import com.TCC.Prato_Justo.Model.Usuario;
import com.TCC.Prato_Justo.Service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private MensagemRepository mensagemRepository;

    @Autowired
    private AnthUsuarioRepository usuarioRepository;

    @Autowired
    private ChatService chatService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Envia uma mensagem do usuário autenticado para outro usuário (destinatárioId)
    @PostMapping("/messages")
    public ResponseEntity<?> sendMessage(@RequestBody SendMessageRequest req) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario remetente = usuarioRepository.findByEmail(email).orElse(null);
        if (remetente == null) {
            return ResponseEntity.status(401).body("Usuário não autenticado");
        }

        Optional<Usuario> destOpt = usuarioRepository.findById(req.getDestinatarioId());
        if (destOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Destinatário não encontrado");
        }
        Usuario destinatario = destOpt.get();

        Mensagem msg = new Mensagem();
        msg.setRemetente(remetente);
        msg.setDestinatario(destinatario);
        msg.setConteudo(req.getConteudo());
        msg.setCriadoEm(LocalDateTime.now());
        msg.setLido(false);

        Mensagem saved = mensagemRepository.save(msg);
        
        // Notificar via WebSocket para ambos os usuários
        Map<String, Object> wsMessage = new HashMap<>();
        wsMessage.put("id", saved.getId());
        wsMessage.put("remetenteId", remetente.getId());
        wsMessage.put("remetenteNome", remetente.getNome());
        wsMessage.put("content", saved.getConteudo());
        wsMessage.put("text", saved.getConteudo());
        wsMessage.put("timestamp", saved.getCriadoEm());
        wsMessage.put("type", "CHAT");
        
        // Enviar para o destinatário
        messagingTemplate.convertAndSendToUser(
            destinatario.getId().toString(),
            "/queue/messages",
            wsMessage
        );
        
        // Enviar de volta para o remetente (confirmação)
        messagingTemplate.convertAndSendToUser(
            remetente.getId().toString(),
            "/queue/messages",
            wsMessage
        );
        
        return ResponseEntity.ok(saved);
    }

    // Lista conversa entre usuário autenticado e outro usuário
    @GetMapping("/conversations/{otherUserId}")
    public ResponseEntity<?> getConversation(@PathVariable Long otherUserId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario me = usuarioRepository.findByEmail(email).orElse(null);
        if (me == null) {
            return ResponseEntity.status(401).body("Usuário não autenticado");
        }

        Optional<Usuario> otherOpt = usuarioRepository.findById(otherUserId);
        if (otherOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Usuário não encontrado");
        }
        Usuario other = otherOpt.get();

        List<Mensagem> conversa = mensagemRepository.conversaEntre(me, other);
        return ResponseEntity.ok(conversa);
    }

    // Lista contatos com quem o usuário já trocou mensagens
    @GetMapping("/contacts")
    public ResponseEntity<?> getContacts() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario me = usuarioRepository.findByEmail(email).orElse(null);
        if (me == null) return ResponseEntity.status(401).body("Usuário não autenticado");

        List<Usuario> contacts = mensagemRepository.findContacts(me);
        return ResponseEntity.ok(contacts);
    }

    // Lista todos os chats do usuário autenticado (com token)
    @GetMapping("/chats")
    public ResponseEntity<?> getChats() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario me = usuarioRepository.findByEmail(email).orElse(null);
        if (me == null) {
            return ResponseEntity.status(401).body("Usuário não autenticado");
        }

        List<Chat> chats = chatService.listarChatsDoUsuario(me);
        
        // Transformar em DTO com informações do outro participante e última mensagem
        List<Map<String, Object>> chatsDTO = chats.stream().map(chat -> {
            Map<String, Object> chatDTO = new HashMap<>();
            chatDTO.put("id", chat.getId());
            chatDTO.put("token", chat.getToken());
            
            // Obter o outro participante
            Usuario outroParticipante = chatService.obterOutroParticipante(chat, me);
            Map<String, Object> outroParticipanteDTO = new HashMap<>();
            outroParticipanteDTO.put("id", outroParticipante.getId());
            outroParticipanteDTO.put("nome", outroParticipante.getNome());
            outroParticipanteDTO.put("email", outroParticipante.getEmail());
            outroParticipanteDTO.put("avatarUrl", outroParticipante.getAvatarUrl());
            chatDTO.put("outroParticipante", outroParticipanteDTO);
            
            // Obter última mensagem se houver
            Optional<Mensagem> ultimaMensagem = chatService.obterUltimaMensagem(chat);
            if (ultimaMensagem.isPresent()) {
                Mensagem msg = ultimaMensagem.get();
                Map<String, Object> mensagemDTO = new HashMap<>();
                mensagemDTO.put("id", msg.getId());
                mensagemDTO.put("conteudo", msg.getConteudo());
                mensagemDTO.put("criadoEm", msg.getCriadoEm());
                mensagemDTO.put("remetenteId", msg.getRemetente().getId());
                chatDTO.put("ultimaMensagem", mensagemDTO);
            }
            
            // Informações da solicitação
            if (chat.getSolicitacao() != null) {
                Map<String, Object> solicitacaoDTO = new HashMap<>();
                solicitacaoDTO.put("id", chat.getSolicitacao().getId());
                solicitacaoDTO.put("status", chat.getSolicitacao().getStatus().getValor());
                if (chat.getSolicitacao().getDoacao() != null) {
                    solicitacaoDTO.put("doacaoTitulo", chat.getSolicitacao().getDoacao().getTitulo());
                }
                chatDTO.put("solicitacao", solicitacaoDTO);
            }
            
            chatDTO.put("criadoEm", chat.getCriadoEm());
            chatDTO.put("ativo", chat.getAtivo());
            
            return chatDTO;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(chatsDTO);
    }

    // DTO para enviar mensagem
    public static class SendMessageRequest {
        private Long destinatarioId;
        private String conteudo;

        public Long getDestinatarioId() { return destinatarioId; }
        public void setDestinatarioId(Long destinatarioId) { this.destinatarioId = destinatarioId; }
        public String getConteudo() { return conteudo; }
        public void setConteudo(String conteudo) { this.conteudo = conteudo; }
    }
}
