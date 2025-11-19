package com.TCC.Prato_Justo.Config;

import com.TCC.Prato_Justo.Interface.AnthUsuarioRepository;
import com.TCC.Prato_Justo.Model.Usuario;
import com.TCC.Prato_Justo.Security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private AnthUsuarioRepository usuarioRepository;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            // Extrair token JWT dos headers
            List<String> authHeaders = accessor.getNativeHeader("Authorization");
            String token = null;
            
            if (authHeaders != null && !authHeaders.isEmpty()) {
                String authHeader = authHeaders.get(0);
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    token = authHeader.substring(7);
                }
            }
            
            // Se não encontrou no header, tentar no token do handshake
            if (token == null) {
                Object tokenObj = accessor.getSessionAttributes().get("token");
                if (tokenObj != null) {
                    token = tokenObj.toString();
                }
            }
            
            if (token != null && jwtUtil.validateToken(token)) {
                try {
                    String email = jwtUtil.getUsernameFromToken(token);
                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                    
                    // Buscar usuário no banco para obter o ID
                    Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);
                    if (usuarioOpt.isPresent()) {
                        Usuario usuario = usuarioOpt.get();
                        
                        // Criar principal customizado com ID do usuário
                        UserPrincipal principal = new UserPrincipal(
                            usuario.getId(),
                            email,
                            userDetails.getAuthorities()
                        );
                        
                        // Definir o principal (usuário autenticado)
                        // O Spring usará principal.getName() para identificar o usuário nos tópicos privados
                        accessor.setUser(principal);
                    }
                } catch (Exception e) {
                    // Se falhar na autenticação, não definir usuário
                    // A conexão será rejeitada se necessário
                    e.printStackTrace();
                }
            }
        }
        
        return message;
    }
}

