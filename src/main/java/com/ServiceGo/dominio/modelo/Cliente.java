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
@Table(name = "clientes_v1")
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long clienteId;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(length = 20)
    private String telefone;

    @Column(length = 160)
    private String email;

    @Column(length = 600)
    private String observacoes;

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
