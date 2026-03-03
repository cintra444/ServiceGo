package com.ServiceGo.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

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
}
