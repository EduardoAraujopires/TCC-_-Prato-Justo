package com.TCC.Prato_Justo.Service;

import com.TCC.Prato_Justo.Interface.ChatRepository;
import com.TCC.Prato_Justo.Interface.DoacaoRepository;
import com.TCC.Prato_Justo.Interface.SolicitacaoRepository;
import com.TCC.Prato_Justo.Model.Chat;
import com.TCC.Prato_Justo.Model.Doacao;
import com.TCC.Prato_Justo.Model.Solicitacao;
import com.TCC.Prato_Justo.Model.StatusSolicitacao;
import com.TCC.Prato_Justo.Model.Usuario;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class SolicitacaoService {

    private final SolicitacaoRepository solicitacaoRepository;
    private final DoacaoRepository doacaoRepository;
    private final ChatRepository chatRepository;

    public SolicitacaoService(SolicitacaoRepository solicitacaoRepository, 
                            DoacaoRepository doacaoRepository,
                            ChatRepository chatRepository) {
        this.solicitacaoRepository = solicitacaoRepository;
        this.doacaoRepository = doacaoRepository;
        this.chatRepository = chatRepository;
    }

    public Solicitacao criar(Doacao doacao, Usuario solicitante) {
        // Verificar se já existe uma solicitação para esta doação por este solicitante
        Optional<Solicitacao> existente = solicitacaoRepository.findByDoacaoIdAndSolicitanteId(
            doacao.getId(), solicitante.getId()
        );
        
        if (existente.isPresent()) {
            Solicitacao solicitacao = existente.get();
            // Se estiver cancelada, reativar
            if (solicitacao.getStatus() == StatusSolicitacao.CANCELADA) {
                solicitacao.setStatus(StatusSolicitacao.SOLICITADA);
                return solicitacaoRepository.save(solicitacao);
            }
            throw new IllegalArgumentException("Você já solicitou esta doação");
        }

        Solicitacao nova = new Solicitacao();
        nova.setDoacao(doacao);
        nova.setSolicitante(solicitante);
        nova.setStatus(StatusSolicitacao.SOLICITADA);
        return solicitacaoRepository.save(nova);
    }

    public List<Solicitacao> listarPorSolicitante(Long solicitanteId) {
        return solicitacaoRepository.findBySolicitanteId(solicitanteId);
    }

    public Optional<Solicitacao> obter(Long id) {
        return solicitacaoRepository.findById(id);
    }

    public Solicitacao atualizarStatus(Long id, StatusSolicitacao novoStatus) {
        Solicitacao solicitacao = solicitacaoRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Solicitação não encontrada"));
        solicitacao.setStatus(novoStatus);
        return solicitacaoRepository.save(solicitacao);
    }

    public void cancelar(Long id) {
        Solicitacao solicitacao = solicitacaoRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Solicitação não encontrada"));
        solicitacao.setStatus(StatusSolicitacao.CANCELADA);
        solicitacaoRepository.save(solicitacao);
    }

    public List<Solicitacao> listarPorDoacao(Long doacaoId) {
        return solicitacaoRepository.findByDoacaoId(doacaoId);
    }

    @Transactional
    public Solicitacao aceitar(Long solicitacaoId, Long doadorId) {
        Solicitacao solicitacao = solicitacaoRepository.findById(solicitacaoId)
            .orElseThrow(() -> new IllegalArgumentException("Solicitação não encontrada"));
        
        // Verificar se o doador é o dono da doação
        if (solicitacao.getDoacao().getDoador() == null || 
            !solicitacao.getDoacao().getDoador().getId().equals(doadorId)) {
            throw new IllegalArgumentException("Você não tem permissão para aceitar esta solicitação");
        }
        
        // Verificar se a solicitação está no status correto
        if (solicitacao.getStatus() != StatusSolicitacao.SOLICITADA) {
            throw new IllegalArgumentException("Apenas solicitações pendentes podem ser aceitas");
        }
        
        // Mudar status para EM_ANDAMENTO
        solicitacao.setStatus(StatusSolicitacao.EM_ANDAMENTO);
        
        // Cancelar outras solicitações pendentes para a mesma doação
        List<Solicitacao> outrasSolicitacoes = solicitacaoRepository.findByDoacaoId(solicitacao.getDoacao().getId());
        outrasSolicitacoes.forEach(s -> {
            if (!s.getId().equals(solicitacaoId) && s.getStatus() == StatusSolicitacao.SOLICITADA) {
                s.setStatus(StatusSolicitacao.CANCELADA);
                solicitacaoRepository.save(s);
            }
        });
        
        // Salvar solicitação atualizada
        Solicitacao solicitacaoSalva = solicitacaoRepository.save(solicitacao);
        
        // Criar Chat entre doador e solicitante
        Usuario doador = solicitacao.getDoacao().getDoador();
        Usuario solicitante = solicitacao.getSolicitante();
        
        // Verificar se já existe um chat entre esses usuários para esta solicitação
        Optional<Chat> chatExistente = chatRepository.findBySolicitacaoId(solicitacaoId);
        
        if (chatExistente.isEmpty()) {
            Chat novoChat = new Chat();
            novoChat.setToken(Chat.gerarToken());
            novoChat.setUsuario1(doador); // Doador
            novoChat.setUsuario2(solicitante); // Solicitante
            novoChat.setSolicitacao(solicitacaoSalva);
            novoChat.setAtivo(true);
            chatRepository.save(novoChat);
        }
        
        return solicitacaoSalva;
    }

    public Solicitacao recusar(Long solicitacaoId, Long doadorId) {
        Solicitacao solicitacao = solicitacaoRepository.findById(solicitacaoId)
            .orElseThrow(() -> new IllegalArgumentException("Solicitação não encontrada"));
        
        // Verificar se o doador é o dono da doação
        if (solicitacao.getDoacao().getDoador() == null || 
            !solicitacao.getDoacao().getDoador().getId().equals(doadorId)) {
            throw new IllegalArgumentException("Você não tem permissão para recusar esta solicitação");
        }
        
        // Verificar se a solicitação está no status correto
        if (solicitacao.getStatus() != StatusSolicitacao.SOLICITADA) {
            throw new IllegalArgumentException("Apenas solicitações pendentes podem ser recusadas");
        }
        
        solicitacao.setStatus(StatusSolicitacao.CANCELADA);
        return solicitacaoRepository.save(solicitacao);
    }

    public Solicitacao marcarColetada(Long solicitacaoId, Long usuarioId) {
        Solicitacao solicitacao = solicitacaoRepository.findById(solicitacaoId)
            .orElseThrow(() -> new IllegalArgumentException("Solicitação não encontrada"));
        
        // Verificar se o usuário é o doador ou o solicitante
        boolean isDoador = solicitacao.getDoacao().getDoador() != null && 
                          solicitacao.getDoacao().getDoador().getId().equals(usuarioId);
        boolean isSolicitante = solicitacao.getSolicitante().getId().equals(usuarioId);
        
        if (!isDoador && !isSolicitante) {
            throw new IllegalArgumentException("Você não tem permissão para marcar esta solicitação como coletada");
        }
        
        // Verificar se a solicitação está em andamento
        if (solicitacao.getStatus() != StatusSolicitacao.EM_ANDAMENTO) {
            throw new IllegalArgumentException("Apenas solicitações em andamento podem ser marcadas como coletadas");
        }
        
        // Mudar status para CONCLUIDA
        solicitacao.setStatus(StatusSolicitacao.CONCLUIDA);
        
        // Desativar a doação
        Doacao doacao = solicitacao.getDoacao();
        doacao.setAtivo(false);
        doacaoRepository.save(doacao);
        
        return solicitacaoRepository.save(solicitacao);
    }
}

