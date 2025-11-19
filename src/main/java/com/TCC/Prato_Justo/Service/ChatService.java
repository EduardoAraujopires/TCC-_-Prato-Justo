package com.TCC.Prato_Justo.Service;

import com.TCC.Prato_Justo.Interface.ChatRepository;
import com.TCC.Prato_Justo.Interface.MensagemRepository;
import com.TCC.Prato_Justo.Model.Chat;
import com.TCC.Prato_Justo.Model.Mensagem;
import com.TCC.Prato_Justo.Model.Usuario;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ChatService {

    private final ChatRepository chatRepository;
    private final MensagemRepository mensagemRepository;

    public ChatService(ChatRepository chatRepository, MensagemRepository mensagemRepository) {
        this.chatRepository = chatRepository;
        this.mensagemRepository = mensagemRepository;
    }

    // Buscar todos os chats de um usuário
    public List<Chat> listarChatsDoUsuario(Usuario usuario) {
        return chatRepository.findByUsuario(usuario);
    }

    // Buscar chat entre dois usuários
    public Optional<Chat> buscarChatEntreUsuarios(Usuario usuario1, Usuario usuario2) {
        return chatRepository.findChatEntreUsuarios(usuario1, usuario2);
    }

    // Buscar chat por token
    public Optional<Chat> buscarChatPorToken(String token) {
        return chatRepository.findByToken(token);
    }

    // Buscar chat por ID
    public Optional<Chat> buscarChatPorId(Long id) {
        return chatRepository.findById(id);
    }

    // Obter o outro participante do chat
    public Usuario obterOutroParticipante(Chat chat, Usuario usuarioAtual) {
        if (chat.getUsuario1().getId().equals(usuarioAtual.getId())) {
            return chat.getUsuario2();
        } else {
            return chat.getUsuario1();
        }
    }

    // Obter última mensagem do chat
    public Optional<Mensagem> obterUltimaMensagem(Chat chat) {
        Usuario usuario1 = chat.getUsuario1();
        Usuario usuario2 = chat.getUsuario2();
        
        List<Mensagem> mensagens = mensagemRepository.conversaEntre(usuario1, usuario2);
        
        if (mensagens.isEmpty()) {
            return Optional.empty();
        }
        
        return Optional.of(mensagens.get(mensagens.size() - 1));
    }
}

