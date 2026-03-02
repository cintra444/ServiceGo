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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
class ClienteControladorV1Tests {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @BeforeEach
    void setup() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    @Test
    @WithMockUser(username = "admin@servicego.local", roles = {"ADMIN"})
    void deveCriarEListarClientesComPaginacao() throws Exception {
        String body = """
                {
                  "nome": "Cliente Teste",
                  "telefone": "11999999999",
                  "email": "cliente.teste@servicego.local",
                  "observacoes": "VIP"
                }
                """;

        mockMvc.perform(post("/api/v1/clientes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.clienteId").exists())
                .andExpect(jsonPath("$.nome").value("Cliente Teste"));

        mockMvc.perform(get("/api/v1/clientes").param("nome", "Cliente").param("page", "0").param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itens").isArray())
                .andExpect(jsonPath("$.totalItens").value(org.hamcrest.Matchers.greaterThanOrEqualTo(1)));
    }
}

