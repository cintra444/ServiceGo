package com.ServiceGo.api.controller;

import com.ServiceGo.api.dto.configuracao.ConfiguracaoUsuarioRequest;
import com.ServiceGo.api.dto.configuracao.ConfiguracaoUsuarioResponse;
import com.ServiceGo.domain.entity.AppUser;
import com.ServiceGo.domain.entity.ConfiguracaoUsuario;
import com.ServiceGo.domain.enums.DepreciacaoAlocacao;
import com.ServiceGo.domain.enums.DepreciacaoModo;
import com.ServiceGo.domain.repository.AppUserRepository;
import com.ServiceGo.domain.repository.ConfiguracaoUsuarioRepository;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.ZoneId;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/configuracoes-usuario")
public class ConfiguracaoUsuarioController {

    private final ConfiguracaoUsuarioRepository configuracaoRepository;
    private final AppUserRepository appUserRepository;

    public ConfiguracaoUsuarioController(
            ConfiguracaoUsuarioRepository configuracaoRepository,
            AppUserRepository appUserRepository
    ) {
        this.configuracaoRepository = configuracaoRepository;
        this.appUserRepository = appUserRepository;
    }

    @GetMapping("/{usuarioId}")
    public ConfiguracaoUsuarioResponse getByUsuario(@PathVariable Long usuarioId) {
        ConfiguracaoUsuario configuracao = obterOuCriarConfiguracao(usuarioId);
        return toResponse(configuracao);
    }

    @PutMapping("/{usuarioId}")
    @ResponseStatus(HttpStatus.OK)
    public ConfiguracaoUsuarioResponse update(
            @PathVariable Long usuarioId,
            @Valid @RequestBody ConfiguracaoUsuarioRequest request
    ) {
        validarFusoHorario(request.fusoHorario());
        validarDepreciacao(request);
        ConfiguracaoUsuario configuracao = obterOuCriarConfiguracao(usuarioId);
        configuracao.setSincronizarCalendario(request.sincronizarCalendario());
        configuracao.setLembreteAtivo(request.lembreteAtivo());
        configuracao.setMinutosAntecedenciaLembrete(request.minutosAntecedenciaLembrete());
        configuracao.setFusoHorario(request.fusoHorario().trim());
        configuracao.setDepreciacaoModo(request.depreciacaoModo());
        configuracao.setDepreciacaoAlocacao(request.depreciacaoAlocacao());
        configuracao.setValorAtualVeiculo(request.valorAtualVeiculo());
        configuracao.setValorEstimadoVeiculo(request.valorEstimadoVeiculo());
        configuracao.setKmBaseDepreciacao(request.kmBaseDepreciacao());
        configuracao.setMesesBaseDepreciacao(request.mesesBaseDepreciacao());
        configuracao.setAnosBaseDepreciacao(request.anosBaseDepreciacao());
        configuracao.setValorManualPorKm(request.valorManualPorKm());
        configuracao.setValorManualMensal(request.valorManualMensal());
        configuracao.setValorManualAnual(request.valorManualAnual());
        return toResponse(configuracaoRepository.save(configuracao));
    }

    private ConfiguracaoUsuario obterOuCriarConfiguracao(Long usuarioId) {
        return configuracaoRepository.findByUsuarioId(usuarioId)
                .orElseGet(() -> configuracaoRepository.save(novaConfiguracaoDefault(usuarioId)));
    }

    private ConfiguracaoUsuario novaConfiguracaoDefault(Long usuarioId) {
        AppUser usuario = appUserRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario nao encontrado"));
        ConfiguracaoUsuario config = new ConfiguracaoUsuario();
        config.setUsuario(usuario);
        config.setSincronizarCalendario(true);
        config.setLembreteAtivo(true);
        config.setMinutosAntecedenciaLembrete(30);
        config.setFusoHorario("America/Sao_Paulo");
        config.setDepreciacaoModo(DepreciacaoModo.AUTOMATICA);
        config.setDepreciacaoAlocacao(DepreciacaoAlocacao.POR_KM);
        config.setValorAtualVeiculo(BigDecimal.ZERO);
        config.setValorEstimadoVeiculo(BigDecimal.ZERO);
        config.setKmBaseDepreciacao(BigDecimal.ONE);
        config.setMesesBaseDepreciacao(1);
        config.setAnosBaseDepreciacao(BigDecimal.ONE);
        config.setValorManualPorKm(null);
        config.setValorManualMensal(null);
        config.setValorManualAnual(null);
        return config;
    }

    private void validarFusoHorario(String fusoHorario) {
        try {
            ZoneId.of(fusoHorario.trim());
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fuso horario invalido");
        }
    }

    private void validarDepreciacao(ConfiguracaoUsuarioRequest request) {
        if (request.depreciacaoModo() == DepreciacaoModo.AUTOMATICA) {
            if (request.valorAtualVeiculo() == null || request.valorEstimadoVeiculo() == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "No modo AUTOMATICA, valorAtualVeiculo e valorEstimadoVeiculo sao obrigatorios"
                );
            }
            if (request.valorEstimadoVeiculo().compareTo(request.valorAtualVeiculo()) > 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "valorEstimadoVeiculo nao pode ser maior que valorAtualVeiculo"
                );
            }
            if (request.valorManualPorKm() != null || request.valorManualMensal() != null || request.valorManualAnual() != null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "No modo AUTOMATICA, os campos de valor manual nao podem ser enviados"
                );
            }
            validarBasePorAlocacao(request.depreciacaoAlocacao(), request.kmBaseDepreciacao(), request.mesesBaseDepreciacao(), request.anosBaseDepreciacao());
            return;
        }

        if (request.valorAtualVeiculo() != null
                || request.valorEstimadoVeiculo() != null
                || request.kmBaseDepreciacao() != null
                || request.mesesBaseDepreciacao() != null
                || request.anosBaseDepreciacao() != null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No modo MANUAL, os campos de calculo automatico nao podem ser enviados"
            );
        }

        switch (request.depreciacaoAlocacao()) {
            case POR_KM -> {
                if (request.valorManualPorKm() == null || request.valorManualMensal() != null || request.valorManualAnual() != null) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "No modo MANUAL com alocacao POR_KM, informe apenas valorManualPorKm"
                    );
                }
            }
            case MENSAL -> {
                if (request.valorManualMensal() == null || request.valorManualPorKm() != null || request.valorManualAnual() != null) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "No modo MANUAL com alocacao MENSAL, informe apenas valorManualMensal"
                    );
                }
            }
            case ANUAL -> {
                if (request.valorManualAnual() == null || request.valorManualPorKm() != null || request.valorManualMensal() != null) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "No modo MANUAL com alocacao ANUAL, informe apenas valorManualAnual"
                    );
                }
            }
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Alocacao de depreciacao invalida");
        }
    }

    private void validarBasePorAlocacao(
            DepreciacaoAlocacao alocacao,
            BigDecimal kmBaseDepreciacao,
            Integer mesesBaseDepreciacao,
            BigDecimal anosBaseDepreciacao
    ) {
        switch (alocacao) {
            case POR_KM -> {
                if (kmBaseDepreciacao == null || mesesBaseDepreciacao != null || anosBaseDepreciacao != null) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "No modo AUTOMATICA com alocacao POR_KM, informe apenas kmBaseDepreciacao"
                    );
                }
            }
            case MENSAL -> {
                if (mesesBaseDepreciacao == null || kmBaseDepreciacao != null || anosBaseDepreciacao != null) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "No modo AUTOMATICA com alocacao MENSAL, informe apenas mesesBaseDepreciacao"
                    );
                }
            }
            case ANUAL -> {
                if (anosBaseDepreciacao == null || kmBaseDepreciacao != null || mesesBaseDepreciacao != null) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "No modo AUTOMATICA com alocacao ANUAL, informe apenas anosBaseDepreciacao"
                    );
                }
            }
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Alocacao de depreciacao invalida");
        }
    }

    private ConfiguracaoUsuarioResponse toResponse(ConfiguracaoUsuario config) {
        return new ConfiguracaoUsuarioResponse(
                config.getId(),
                config.getUsuario().getId(),
                config.isSincronizarCalendario(),
                config.isLembreteAtivo(),
                config.getMinutosAntecedenciaLembrete(),
                config.getFusoHorario(),
                config.getDepreciacaoModo(),
                config.getDepreciacaoAlocacao(),
                config.getValorAtualVeiculo(),
                config.getValorEstimadoVeiculo(),
                config.getKmBaseDepreciacao(),
                config.getMesesBaseDepreciacao(),
                config.getAnosBaseDepreciacao(),
                config.getValorManualPorKm(),
                config.getValorManualMensal(),
                config.getValorManualAnual()
        );
    }
}
