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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
class VeiculoControladorV1Tests {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @BeforeEach
    void setup() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    @Test
    @WithMockUser(username = "admin@servicego.local", roles = {"ADMIN"})
    void deveBloquearReducaoDeKm() throws Exception {
        String criarBody = """
                {
                  "placa": "ABC1234",
                  "modelo": "Sedan",
                  "ano": 2024,
                  "kmAtual": 50000
                }
                """;

        String resposta = mockMvc.perform(post("/api/v1/veiculos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(criarBody))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Number veiculoId = com.jayway.jsonpath.JsonPath.read(resposta, "$.veiculoId");

        String reduzirKmBody = """
                {
                  "kmAtual": 49000
                }
                """;

        mockMvc.perform(patch("/api/v1/veiculos/{veiculoId}/km-atual", veiculoId.longValue())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(reduzirKmBody))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.titulo").value("Regra de negocio violada"));
    }
}

