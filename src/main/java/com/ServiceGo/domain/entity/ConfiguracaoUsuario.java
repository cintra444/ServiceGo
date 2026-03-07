package com.ServiceGo.domain.entity;

import com.ServiceGo.domain.enums.DepreciacaoAlocacao;
import com.ServiceGo.domain.enums.DepreciacaoModo;
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
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "configuracoes_usuario")
public class ConfiguracaoUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private AppUser usuario;

    @Column(name = "sincronizar_calendario", nullable = false)
    private boolean sincronizarCalendario;

    @Column(name = "lembrete_ativo", nullable = false)
    private boolean lembreteAtivo;

    @Column(name = "minutos_antecedencia_lembrete", nullable = false)
    private Integer minutosAntecedenciaLembrete;

    @Column(name = "fuso_horario", nullable = false, length = 80)
    private String fusoHorario;

    @Enumerated(EnumType.STRING)
    @Column(name = "depreciacao_modo", nullable = false, length = 20)
    private DepreciacaoModo depreciacaoModo;

    @Enumerated(EnumType.STRING)
    @Column(name = "depreciacao_alocacao", nullable = false, length = 20)
    private DepreciacaoAlocacao depreciacaoAlocacao;

    @Column(name = "valor_atual_veiculo", precision = 12, scale = 2)
    private BigDecimal valorAtualVeiculo;

    @Column(name = "valor_estimado_veiculo", precision = 12, scale = 2)
    private BigDecimal valorEstimadoVeiculo;

    @Column(name = "km_base_depreciacao", precision = 12, scale = 2)
    private BigDecimal kmBaseDepreciacao;

    @Column(name = "meses_base_depreciacao")
    private Integer mesesBaseDepreciacao;

    @Column(name = "anos_base_depreciacao", precision = 10, scale = 2)
    private BigDecimal anosBaseDepreciacao;

    @Column(name = "valor_manual_por_km", precision = 12, scale = 6)
    private BigDecimal valorManualPorKm;

    @Column(name = "valor_manual_mensal", precision = 12, scale = 2)
    private BigDecimal valorManualMensal;

    @Column(name = "valor_manual_anual", precision = 12, scale = 2)
    private BigDecimal valorManualAnual;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public AppUser getUsuario() {
        return usuario;
    }

    public void setUsuario(AppUser usuario) {
        this.usuario = usuario;
    }

    public boolean isSincronizarCalendario() {
        return sincronizarCalendario;
    }

    public void setSincronizarCalendario(boolean sincronizarCalendario) {
        this.sincronizarCalendario = sincronizarCalendario;
    }

    public boolean isLembreteAtivo() {
        return lembreteAtivo;
    }

    public void setLembreteAtivo(boolean lembreteAtivo) {
        this.lembreteAtivo = lembreteAtivo;
    }

    public Integer getMinutosAntecedenciaLembrete() {
        return minutosAntecedenciaLembrete;
    }

    public void setMinutosAntecedenciaLembrete(Integer minutosAntecedenciaLembrete) {
        this.minutosAntecedenciaLembrete = minutosAntecedenciaLembrete;
    }

    public String getFusoHorario() {
        return fusoHorario;
    }

    public void setFusoHorario(String fusoHorario) {
        this.fusoHorario = fusoHorario;
    }

    public DepreciacaoModo getDepreciacaoModo() {
        return depreciacaoModo;
    }

    public void setDepreciacaoModo(DepreciacaoModo depreciacaoModo) {
        this.depreciacaoModo = depreciacaoModo;
    }

    public DepreciacaoAlocacao getDepreciacaoAlocacao() {
        return depreciacaoAlocacao;
    }

    public void setDepreciacaoAlocacao(DepreciacaoAlocacao depreciacaoAlocacao) {
        this.depreciacaoAlocacao = depreciacaoAlocacao;
    }

    public BigDecimal getValorAtualVeiculo() {
        return valorAtualVeiculo;
    }

    public void setValorAtualVeiculo(BigDecimal valorAtualVeiculo) {
        this.valorAtualVeiculo = valorAtualVeiculo;
    }

    public BigDecimal getValorEstimadoVeiculo() {
        return valorEstimadoVeiculo;
    }

    public void setValorEstimadoVeiculo(BigDecimal valorEstimadoVeiculo) {
        this.valorEstimadoVeiculo = valorEstimadoVeiculo;
    }

    public BigDecimal getKmBaseDepreciacao() {
        return kmBaseDepreciacao;
    }

    public void setKmBaseDepreciacao(BigDecimal kmBaseDepreciacao) {
        this.kmBaseDepreciacao = kmBaseDepreciacao;
    }

    public Integer getMesesBaseDepreciacao() {
        return mesesBaseDepreciacao;
    }

    public void setMesesBaseDepreciacao(Integer mesesBaseDepreciacao) {
        this.mesesBaseDepreciacao = mesesBaseDepreciacao;
    }

    public BigDecimal getAnosBaseDepreciacao() {
        return anosBaseDepreciacao;
    }

    public void setAnosBaseDepreciacao(BigDecimal anosBaseDepreciacao) {
        this.anosBaseDepreciacao = anosBaseDepreciacao;
    }

    public BigDecimal getValorManualPorKm() {
        return valorManualPorKm;
    }

    public void setValorManualPorKm(BigDecimal valorManualPorKm) {
        this.valorManualPorKm = valorManualPorKm;
    }

    public BigDecimal getValorManualMensal() {
        return valorManualMensal;
    }

    public void setValorManualMensal(BigDecimal valorManualMensal) {
        this.valorManualMensal = valorManualMensal;
    }

    public BigDecimal getValorManualAnual() {
        return valorManualAnual;
    }

    public void setValorManualAnual(BigDecimal valorManualAnual) {
        this.valorManualAnual = valorManualAnual;
    }
}
