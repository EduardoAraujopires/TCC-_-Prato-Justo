package com.TCC.Prato_Justo.Model;

public enum StatusSolicitacao {
    SOLICITADA("solicitada"),
    EM_ANDAMENTO("em_andamento"),
    CONCLUIDA("concluida"),
    CANCELADA("cancelada");

    private final String valor;

    StatusSolicitacao(String valor) {
        this.valor = valor;
    }

    public String getValor() {
        return valor;
    }

    public static StatusSolicitacao fromString(String valor) {
        for (StatusSolicitacao status : StatusSolicitacao.values()) {
            if (status.valor.equalsIgnoreCase(valor)) {
                return status;
            }
        }
        return SOLICITADA; // Default
    }
}

