package com.ServiceGo.api.controller;

import com.ServiceGo.api.dto.relatorio.RelatorioFinanceiroResponse;
import com.ServiceGo.domain.entity.ConfiguracaoUsuario;
import com.ServiceGo.domain.entity.Expense;
import com.ServiceGo.domain.entity.Trip;
import com.ServiceGo.domain.enums.DepreciacaoAlocacao;
import com.ServiceGo.domain.enums.DepreciacaoModo;
import com.ServiceGo.domain.repository.ConfiguracaoUsuarioRepository;
import com.ServiceGo.domain.repository.ExpenseRepository;
import com.ServiceGo.domain.repository.TripRepository;
import com.ServiceGo.security.PlanAccessService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/relatorios")
public class RelatorioController {

    private static final BigDecimal ZERO = BigDecimal.ZERO;
    private static final BigDecimal DAYS_IN_MONTH = new BigDecimal("30");
    private static final BigDecimal DAYS_IN_YEAR = new BigDecimal("365");

    private final TripRepository tripRepository;
    private final ExpenseRepository expenseRepository;
    private final ConfiguracaoUsuarioRepository configuracaoUsuarioRepository;
    private final PlanAccessService planAccessService;

    public RelatorioController(
            TripRepository tripRepository,
            ExpenseRepository expenseRepository,
            ConfiguracaoUsuarioRepository configuracaoUsuarioRepository,
            PlanAccessService planAccessService
    ) {
        this.tripRepository = tripRepository;
        this.expenseRepository = expenseRepository;
        this.configuracaoUsuarioRepository = configuracaoUsuarioRepository;
        this.planAccessService = planAccessService;
    }

    @GetMapping("/financeiro")
    public RelatorioFinanceiroResponse financeiro(
            @RequestParam Long usuarioId,
            @RequestParam(required = false) Long veiculoId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime fim,
            Authentication authentication
    ) {
        planAccessService.ensurePremiumUser(usuarioId, authentication);
        OffsetDateTime fimPeriodo = fim != null ? fim : OffsetDateTime.now();
        OffsetDateTime inicioPeriodo = inicio != null ? inicio : fimPeriodo.minusDays(30);
        if (inicioPeriodo.isAfter(fimPeriodo)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "inicio nao pode ser maior que fim");
        }

        List<Trip> trips = buscarTrips(usuarioId, veiculoId, inicioPeriodo, fimPeriodo);
        List<Expense> expenses = buscarExpenses(usuarioId, veiculoId, inicioPeriodo, fimPeriodo);

        BigDecimal receitaTotal = trips.stream()
                .map(this::valorReceitaTrip)
                .reduce(ZERO, BigDecimal::add);
        BigDecimal kmTotal = trips.stream()
                .map(trip -> trip.getDistanceKm() == null ? ZERO : trip.getDistanceKm())
                .reduce(ZERO, BigDecimal::add);
        BigDecimal custosVariaveis = expenses.stream()
                .map(expense -> expense.getAmount() == null ? ZERO : expense.getAmount())
                .reduce(ZERO, BigDecimal::add);

        ConfiguracaoUsuario config = configuracaoUsuarioRepository.findByUsuarioId(usuarioId).orElse(null);
        BigDecimal depreciacaoPeriodo = calcularDepreciacaoPeriodo(config, kmTotal, inicioPeriodo, fimPeriodo);
        BigDecimal custoOperacionalTotal = custosVariaveis.add(depreciacaoPeriodo);
        BigDecimal lucroTotal = receitaTotal.subtract(custoOperacionalTotal);

        long totalCorridas = trips.size();
        long diasPeriodo = ChronoUnit.DAYS.between(inicioPeriodo.toLocalDate(), fimPeriodo.toLocalDate()) + 1;
        BigDecimal fatorMes = new BigDecimal(diasPeriodo).divide(DAYS_IN_MONTH, 6, RoundingMode.HALF_UP);

        return new RelatorioFinanceiroResponse(
                usuarioId,
                veiculoId,
                inicioPeriodo,
                fimPeriodo,
                totalCorridas,
                kmTotal,
                receitaTotal,
                custosVariaveis,
                depreciacaoPeriodo,
                custoOperacionalTotal,
                safeDivide(custoOperacionalTotal, kmTotal),
                lucroTotal,
                safeDivide(lucroTotal, kmTotal),
                totalCorridas > 0 ? lucroTotal.divide(new BigDecimal(totalCorridas), 6, RoundingMode.HALF_UP) : ZERO,
                lucroTotal.divide(new BigDecimal(diasPeriodo), 6, RoundingMode.HALF_UP),
                fatorMes.compareTo(ZERO) > 0 ? lucroTotal.divide(fatorMes, 6, RoundingMode.HALF_UP) : ZERO
        );
    }

    private List<Trip> buscarTrips(Long usuarioId, Long veiculoId, OffsetDateTime inicio, OffsetDateTime fim) {
        if (veiculoId == null) {
            return tripRepository.findByVeiculoDonoVeiculoIdAndStartAtBetween(usuarioId, inicio, fim);
        }
        return tripRepository.findByVeiculoDonoVeiculoIdAndVeiculoIdAndStartAtBetween(usuarioId, veiculoId, inicio, fim);
    }

    private List<Expense> buscarExpenses(Long usuarioId, Long veiculoId, OffsetDateTime inicio, OffsetDateTime fim) {
        if (veiculoId == null) {
            return expenseRepository.findByVeiculoDonoVeiculoIdAndOccurredAtBetween(usuarioId, inicio, fim);
        }
        return expenseRepository.findByVeiculoDonoVeiculoIdAndVeiculoIdAndOccurredAtBetween(usuarioId, veiculoId, inicio, fim);
    }

    private BigDecimal valorReceitaTrip(Trip trip) {
        if (trip.getActualAmount() != null) {
            return trip.getActualAmount();
        }
        if (trip.getEstimatedAmount() != null) {
            return trip.getEstimatedAmount();
        }
        return ZERO;
    }

    private BigDecimal calcularDepreciacaoPeriodo(
            ConfiguracaoUsuario config,
            BigDecimal kmTotal,
            OffsetDateTime inicio,
            OffsetDateTime fim
    ) {
        if (config == null) {
            return ZERO;
        }

        BigDecimal depreciacaoUnitaria = calcularDepreciacaoUnitaria(config);
        if (depreciacaoUnitaria.compareTo(ZERO) <= 0) {
            return ZERO;
        }

        return switch (config.getDepreciacaoAlocacao()) {
            case POR_KM -> depreciacaoUnitaria.multiply(kmTotal);
            case MENSAL -> {
                long diasPeriodo = ChronoUnit.DAYS.between(inicio.toLocalDate(), fim.toLocalDate()) + 1;
                BigDecimal mesesPeriodo = new BigDecimal(diasPeriodo).divide(DAYS_IN_MONTH, 6, RoundingMode.HALF_UP);
                yield depreciacaoUnitaria.multiply(mesesPeriodo);
            }
            case ANUAL -> {
                long diasPeriodo = ChronoUnit.DAYS.between(inicio.toLocalDate(), fim.toLocalDate()) + 1;
                BigDecimal anosPeriodo = new BigDecimal(diasPeriodo).divide(DAYS_IN_YEAR, 6, RoundingMode.HALF_UP);
                yield depreciacaoUnitaria.multiply(anosPeriodo);
            }
        };
    }

    private BigDecimal calcularDepreciacaoUnitaria(ConfiguracaoUsuario config) {
        DepreciacaoModo modo = config.getDepreciacaoModo();
        DepreciacaoAlocacao alocacao = config.getDepreciacaoAlocacao();
        if (modo == null || alocacao == null) {
            return ZERO;
        }

        if (modo == DepreciacaoModo.MANUAL) {
            return switch (alocacao) {
                case POR_KM -> config.getValorManualPorKm() == null ? ZERO : config.getValorManualPorKm();
                case MENSAL -> config.getValorManualMensal() == null ? ZERO : config.getValorManualMensal();
                case ANUAL -> config.getValorManualAnual() == null ? ZERO : config.getValorManualAnual();
            };
        }

        BigDecimal valorAtual = config.getValorAtualVeiculo();
        BigDecimal valorEstimado = config.getValorEstimadoVeiculo();
        if (valorAtual == null || valorEstimado == null || valorEstimado.compareTo(valorAtual) > 0) {
            return ZERO;
        }
        BigDecimal depreciacaoTotal = valorAtual.subtract(valorEstimado);

        return switch (alocacao) {
            case POR_KM -> safeDivide(depreciacaoTotal, config.getKmBaseDepreciacao());
            case MENSAL -> config.getMesesBaseDepreciacao() == null
                    ? ZERO
                    : safeDivide(depreciacaoTotal, new BigDecimal(config.getMesesBaseDepreciacao()));
            case ANUAL -> safeDivide(depreciacaoTotal, config.getAnosBaseDepreciacao());
        };
    }

    private BigDecimal safeDivide(BigDecimal value, BigDecimal divisor) {
        if (value == null || divisor == null || divisor.compareTo(ZERO) <= 0) {
            return ZERO;
        }
        return value.divide(divisor, 6, RoundingMode.HALF_UP);
    }
}
