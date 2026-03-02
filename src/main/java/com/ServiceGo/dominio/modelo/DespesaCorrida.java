package com.ServiceGo.dominio.modelo;

import com.ServiceGo.dominio.enumeracao.TipoDespesa;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "despesas_corrida_v1")
public class DespesaCorrida {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long despesaId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "corrida_id", nullable = false)
    private Corrida corrida;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_despesa", nullable = false, length = 30)
    private TipoDespesa tipoDespesa;

    @Column(length = 600)
    private String descricao;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal valor;

    @Column(name = "data_hora", nullable = false)
    private OffsetDateTime dataHora;

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
