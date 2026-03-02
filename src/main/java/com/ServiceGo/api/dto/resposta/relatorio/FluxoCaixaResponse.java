package com.ServiceGo.api.dto.resposta.relatorio;

import java.util.List;

public record FluxoCaixaResponse(
        FluxoCaixaResumoResponse resumo,
        List<FluxoCaixaItemResponse> itens,
        int pagina,
        int tamanho,
        long totalItens,
        int totalPaginas
) {
}
