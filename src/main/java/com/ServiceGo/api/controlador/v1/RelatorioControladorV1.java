package com.ServiceGo.api.controlador.v1;

import com.ServiceGo.api.dto.resposta.relatorio.FluxoCaixaResponse;
import com.ServiceGo.api.dto.resposta.relatorio.FluxoCaixaResumoResponse;
import com.ServiceGo.aplicacao.servico.RelatorioServico;
import com.ServiceGo.dominio.enumeracao.FonteCorrida;
import com.ServiceGo.dominio.enumeracao.TipoCorrida;
import java.time.OffsetDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/relatorios")
public class RelatorioControladorV1 {

    private final RelatorioServico relatorioServico;

    public RelatorioControladorV1(RelatorioServico relatorioServico) {
        this.relatorioServico = relatorioServico;
    }

    @GetMapping("/fluxo-caixa")
    public FluxoCaixaResponse gerarFluxoCaixa(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime dataHoraInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime dataHoraFim,
            @RequestParam(required = false) FonteCorrida fonte,
            @RequestParam(required = false) TipoCorrida tipo,
            @RequestParam(required = false) Long clienteId,
            @RequestParam(required = false) Long veiculoId,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "20") int tamanho
    ) {
        Pageable pageable = PageRequest.of(pagina, tamanho, Sort.by("dataHoraAgendada").descending());
        Page<com.ServiceGo.dominio.modelo.Corrida> page = relatorioServico.buscarItensFluxoCaixa(
                dataHoraInicio,
                dataHoraFim,
                fonte,
                tipo,
                clienteId,
                veiculoId,
                pageable
        );

        FluxoCaixaResumoResponse resumo = relatorioServico.gerarResumo(dataHoraInicio, dataHoraFim, page.getContent());
        return new FluxoCaixaResponse(
                resumo,
                page.getContent().stream().map(relatorioServico::paraItem).toList(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()
        );
    }
}
