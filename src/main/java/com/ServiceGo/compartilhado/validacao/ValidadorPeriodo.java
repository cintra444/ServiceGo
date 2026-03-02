package com.ServiceGo.compartilhado.validacao;

import com.ServiceGo.dominio.excecao.RegraNegocioException;
import java.time.OffsetDateTime;

public final class ValidadorPeriodo {

    private ValidadorPeriodo() {
    }

    public static void validarInicioFim(OffsetDateTime inicio, OffsetDateTime fim, String campoInicio, String campoFim) {
        if (inicio == null || fim == null) {
            throw new RegraNegocioException(campoInicio + " e " + campoFim + " sao obrigatorios");
        }
        if (inicio.isAfter(fim)) {
            throw new RegraNegocioException(campoInicio + " deve ser menor ou igual a " + campoFim);
        }
    }

    public static void validarJanelaMaximaMeses(OffsetDateTime inicio, OffsetDateTime fim, int meses) {
        if (inicio.plusMonths(meses).isBefore(fim)) {
            throw new RegraNegocioException("Periodo maximo permitido e de " + meses + " meses");
        }
    }
}
