package com.ServiceGo.dominio.modelo;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "veiculos_v1")
public class Veiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long veiculoId;

    @Column(nullable = false, unique = true, length = 8)
    private String placa;

    @Column(nullable = false, length = 120)
    private String modelo;

    @Column(nullable = false)
    private Integer ano;

    @Column(nullable = false)
    private Long kmAtual;

    @Column(nullable = false)
    private OffsetDateTime criadoEm;

    @Column(nullable = false)
    private OffsetDateTime atualizadoEm;

    @PrePersist
    public void prePersist() {
        OffsetDateTime agora = OffsetDateTime.now();
        this.criadoEm = agora;
        this.atualizadoEm = agora;
    }

    @PreUpdate
    public void preUpdate() {
        this.atualizadoEm = OffsetDateTime.now();
    }
}
