package com.TCC.Prato_Justo.Config;

import org.springframework.security.core.GrantedAuthority;

import java.security.Principal;
import java.util.Collection;

public class UserPrincipal implements Principal {
    private final Long userId;
    private final String username;
    private final Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(Long userId, String username, Collection<? extends GrantedAuthority> authorities) {
        this.userId = userId;
        this.username = username;
        this.authorities = authorities;
    }

    @Override
    public String getName() {
        // Retornar o ID do usuário como string para usar nos tópicos privados
        return userId.toString();
    }

    public Long getUserId() {
        return userId;
    }

    public String getUsername() {
        return username;
    }

    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }
}

