package com.TCC.Prato_Justo.Model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "chat")
public class Chat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_chat")
    private Long id;

    @Column(name = "token", unique = true, nullable = false, length = 36)
    private String token;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "id_usuario1")
    @JsonIgnoreProperties({"senhaUsuario", "dataCadastro", "statusAtivo", "verificado"})
    private Usuario usuario1; // Doador

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "id_usuario2")
    @JsonIgnoreProperties({"senhaUsuario", "dataCadastro", "statusAtivo", "verificado"})
    private Usuario usuario2; // Solicitante

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "id_solicitacao")
    @JsonIgnoreProperties({"doacao", "solicitante"})
    private Solicitacao solicitacao;

    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();

    @Column(name = "ativo", nullable = false)
    private Boolean ativo = true;

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Usuario getUsuario1() {
        return usuario1;
    }

    public void setUsuario1(Usuario usuario1) {
        this.usuario1 = usuario1;
    }

    public Usuario getUsuario2() {
        return usuario2;
    }

    public void setUsuario2(Usuario usuario2) {
        this.usuario2 = usuario2;
    }

    public Solicitacao getSolicitacao() {
        return solicitacao;
    }

    public void setSolicitacao(Solicitacao solicitacao) {
        this.solicitacao = solicitacao;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(LocalDateTime criadoEm) {
        this.criadoEm = criadoEm;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

    // Método para gerar token único
    public static String gerarToken() {
        return UUID.randomUUID().toString();
    }
}

