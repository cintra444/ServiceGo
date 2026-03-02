package com.ServiceGo.dominio.modelo;

import com.ServiceGo.dominio.enumeracao.FonteCorrida;
import com.ServiceGo.dominio.enumeracao.StatusCorrida;
import com.ServiceGo.dominio.enumeracao.TipoCorrida;
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
@Table(name = "corridas_v1")
public class Corrida {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long corridaId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "veiculo_id", nullable = false)
    private Veiculo veiculo;

    @Column(nullable = false, length = 180)
    private String origem;

    @Column(nullable = false, length = 180)
    private String destino;

    @Column(name = "data_hora_agendada", nullable = false)
    private OffsetDateTime dataHoraAgendada;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusCorrida status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private FonteCorrida fonte;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoCorrida tipo;

    @Column(name = "valor_bruto", precision = 12, scale = 2)
    private BigDecimal valorBruto;

    @Column(name = "taxa_plataforma", precision = 12, scale = 2)
    private BigDecimal taxaPlataforma;

    @Column(name = "km_rodados", precision = 10, scale = 2)
    private BigDecimal kmRodados;

    @Column(name = "valor_liquido", precision = 12, scale = 2)
    private BigDecimal valorLiquido;

    @Column(precision = 12, scale = 2, nullable = false)
    private BigDecimal despesas;

    @Column(precision = 12, scale = 2, nullable = false)
    private BigDecimal lucro;

    @Column(length = 600)
    private String observacoes;

    @Column(name = "motivo_cancelamento", length = 600)
    private String motivoCancelamento;

    @Column(name = "data_hora_cancelamento")
    private OffsetDateTime dataHoraCancelamento;

    @Column(nullable = false)
    private OffsetDateTime criadoEm;

    @Column(nullable = false)
    private OffsetDateTime atualizadoEm;

    @PrePersist
    public void prePersist() {
        OffsetDateTime agora = OffsetDateTime.now();
        this.criadoEm = agora;
        this.atualizadoEm = agora;
        if (this.despesas == null) {
            this.despesas = BigDecimal.ZERO;
        }
        if (this.lucro == null) {
            this.lucro = BigDecimal.ZERO;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.atualizadoEm = OffsetDateTime.now();
    }
}
