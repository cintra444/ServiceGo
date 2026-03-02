package com.ServiceGo.api.dto.resposta.compartilhado;

import java.util.List;

public record PaginacaoResponse<T>(
        List<T> itens,
        int pagina,
        int tamanho,
        long totalItens,
        int totalPaginas
) {
}
