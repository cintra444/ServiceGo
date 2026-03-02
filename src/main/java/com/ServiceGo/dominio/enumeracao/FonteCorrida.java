package com.ServiceGo.dominio.enumeracao;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum FonteCorrida {
    UBER,
    @JsonProperty("99")
    NOVE_NOVE,
    PARTICULAR
}
