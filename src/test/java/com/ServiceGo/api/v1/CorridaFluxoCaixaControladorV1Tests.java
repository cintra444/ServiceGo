package com.ServiceGo.api.v1;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
class CorridaFluxoCaixaControladorV1Tests {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @BeforeEach
    void setup() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    @Test
    @WithMockUser(username = "admin@servicego.local", roles = {"ADMIN"})
    void deveExecutarFluxoAgendamentoDespesaConclusaoERelatorio() throws Exception {
        String clienteResp = mockMvc.perform(post("/api/v1/clientes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome":"Cliente Corrida","telefone":"11988887777","email":"cliente.corrida@servicego.local","observacoes":""}
                                """))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Number clienteId = com.jayway.jsonpath.JsonPath.read(clienteResp, "$.clienteId");

        String veiculoResp = mockMvc.perform(post("/api/v1/veiculos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"placa":"DEF1234","modelo":"Hatch","ano":2023,"kmAtual":10000}
                                """))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Number veiculoId = com.jayway.jsonpath.JsonPath.read(veiculoResp, "$.veiculoId");

        String corridaResp = mockMvc.perform(post("/api/v1/corridas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "clienteId": %d,
                                  "veiculoId": %d,
                                  "origem": "Centro",
                                  "destino": "Aeroporto",
                                  "dataHoraAgendada": "2026-03-02T10:00:00-03:00",
                                  "fonte": "UBER",
                                  "tipo": "AEROPORTO",
                                  "valorBrutoEstimado": 150.00,
                                  "taxaPlataformaEstimada": 30.00,
                                  "observacoes": "agenda manha"
                                }
                                """.formatted(clienteId.longValue(), veiculoId.longValue())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("AGENDADA"))
                .andReturn().getResponse().getContentAsString();
        Number corridaId = com.jayway.jsonpath.JsonPath.read(corridaResp, "$.corridaId");

        mockMvc.perform(post("/api/v1/corridas/{corridaId}/despesas", corridaId.longValue())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "tipoDespesa": "COMBUSTIVEL",
                                  "descricao": "Abastecimento",
                                  "valor": 20.00,
                                  "dataHora": "2026-03-02T10:30:00-03:00"
                                }
                                """))
                .andExpect(status().isCreated());

        mockMvc.perform(patch("/api/v1/corridas/{corridaId}/conclusao", corridaId.longValue())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "dataHoraInicio": "2026-03-02T10:00:00-03:00",
                                  "dataHoraFim": "2026-03-02T11:00:00-03:00",
                                  "valorBruto": 160.00,
                                  "taxaPlataforma": 32.00,
                                  "kmRodados": 24.5,
                                  "observacoesConclusao": "finalizada"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONCLUIDA"))
                .andExpect(jsonPath("$.valorLiquido").value(128.0))
                .andExpect(jsonPath("$.despesas").value(20.0))
                .andExpect(jsonPath("$.lucro").value(108.0));

        mockMvc.perform(get("/api/v1/relatorios/fluxo-caixa")
                        .param("dataHoraInicio", "2026-03-01T00:00:00-03:00")
                        .param("dataHoraFim", "2026-03-03T00:00:00-03:00")
                        .param("pagina", "0")
                        .param("tamanho", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.resumo.totalCorridas").value(org.hamcrest.Matchers.greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.itens[0].corridaId").exists());
    }
}

