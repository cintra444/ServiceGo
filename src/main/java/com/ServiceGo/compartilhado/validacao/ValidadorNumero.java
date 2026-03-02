package com.ServiceGo.compartilhado.validacao;

import com.ServiceGo.dominio.excecao.RegraNegocioException;
import java.math.BigDecimal;

public final class ValidadorNumero {

    private ValidadorNumero() {
    }

    public static void validarNaoNegativo(BigDecimal valor, String campo) {
        if (valor != null && valor.compareTo(BigDecimal.ZERO) < 0) {
            throw new RegraNegocioException(campo + " nao pode ser negativo");
        }
    }

    public static void validarNaoNuloENaoNegativo(BigDecimal valor, String campo) {
        if (valor == null) {
            throw new RegraNegocioException(campo + " e obrigatorio");
        }
        validarNaoNegativo(valor, campo);
    }
}
