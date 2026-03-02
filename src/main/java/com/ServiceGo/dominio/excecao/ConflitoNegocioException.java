package com.ServiceGo.dominio.excecao;

public class ConflitoNegocioException extends RuntimeException {

    public ConflitoNegocioException(String message) {
        super(message);
    }
}
