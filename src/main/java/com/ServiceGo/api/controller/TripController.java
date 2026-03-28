package com.ServiceGo.api.controller;

import com.ServiceGo.api.dto.trip.TripRequest;
import com.ServiceGo.api.dto.trip.TripResponse;
import com.ServiceGo.domain.entity.AgendamentoViagem;
import com.ServiceGo.domain.entity.ConfiguracaoUsuario;
import com.ServiceGo.domain.entity.Customer;
import com.ServiceGo.domain.entity.Expense;
import com.ServiceGo.domain.entity.Trip;
import com.ServiceGo.domain.entity.AppUser;
import com.ServiceGo.domain.entity.Veiculo;
import com.ServiceGo.domain.enums.StatusAgendamento;
import com.ServiceGo.domain.enums.DepreciacaoAlocacao;
import com.ServiceGo.domain.enums.DepreciacaoModo;
import com.ServiceGo.domain.enums.ExpenseCategory;
import com.ServiceGo.domain.enums.TripStatus;
import com.ServiceGo.domain.enums.UserRole;
import com.ServiceGo.domain.repository.AgendamentoViagemRepository;
import com.ServiceGo.domain.repository.ConfiguracaoUsuarioRepository;
import com.ServiceGo.domain.repository.CustomerRepository;
import com.ServiceGo.domain.repository.ExpenseRepository;
import com.ServiceGo.domain.repository.PaymentRepository;
import com.ServiceGo.domain.repository.TripRepository;
import com.ServiceGo.domain.repository.VeiculoRepository;
import com.ServiceGo.security.PlanAccessService;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/trips")
public class TripController {

    private final TripRepository tripRepository;
    private final CustomerRepository customerRepository;
    private final VeiculoRepository veiculoRepository;
    private final AgendamentoViagemRepository agendamentoRepository;
    private final ConfiguracaoUsuarioRepository configuracaoUsuarioRepository;
    private final PaymentRepository paymentRepository;
    private final ExpenseRepository expenseRepository;
    private final PlanAccessService planAccessService;

    public TripController(
            TripRepository tripRepository,
            CustomerRepository customerRepository,
            VeiculoRepository veiculoRepository,
            AgendamentoViagemRepository agendamentoRepository,
            ConfiguracaoUsuarioRepository configuracaoUsuarioRepository,
            PaymentRepository paymentRepository,
            ExpenseRepository expenseRepository,
            PlanAccessService planAccessService
    ) {
        this.tripRepository = tripRepository;
        this.customerRepository = customerRepository;
        this.veiculoRepository = veiculoRepository;
        this.agendamentoRepository = agendamentoRepository;
        this.configuracaoUsuarioRepository = configuracaoUsuarioRepository;
        this.paymentRepository = paymentRepository;
        this.expenseRepository = expenseRepository;
        this.planAccessService = planAccessService;
    }

    @GetMapping
    public List<TripResponse> list(Authentication authentication) {
        AppUser authenticatedUser = planAccessService.getAuthenticatedUser(authentication);
        List<Trip> trips = authenticatedUser.getRole() == UserRole.ADMINISTRADOR
                ? tripRepository.findAll()
                : tripRepository.findByVeiculoDonoVeiculoIdOrderByStartAtDesc(authenticatedUser.getId());
        return trips.stream().map(this::toResponse).toList();
    }

    @GetMapping("/{id}")
    public TripResponse getById(@PathVariable Long id, Authentication authentication) {
        Trip trip = resolveTrip(id, authentication);
        return toResponse(trip);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public TripResponse create(@Valid @RequestBody TripRequest request, Authentication authentication) {
        Trip trip = new Trip();
        applyRequest(request, trip, authentication);
        trip.setCreatedAt(OffsetDateTime.now());
        Trip saved = tripRepository.save(trip);
        sincronizarAgendamentoAutomatico(saved);
        sincronizarDespesaPedagio(saved);
        return toResponse(saved);
    }

    @PutMapping("/{id}")
    @Transactional
    public TripResponse update(@PathVariable Long id, @Valid @RequestBody TripRequest request, Authentication authentication) {
        Trip trip = resolveTrip(id, authentication);
        applyRequest(request, trip, authentication);
        Trip saved = tripRepository.save(trip);
        sincronizarAgendamentoAutomatico(saved);
        sincronizarDespesaPedagio(saved);
        return toResponse(saved);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication authentication) {
        Trip trip = resolveTrip(id, authentication);
        paymentRepository.deleteAll(paymentRepository.findByTripId(id));
        expenseRepository.deleteAll(expenseRepository.findByTripId(id));
        agendamentoRepository.findByTripId(id).ifPresent(agendamentoRepository::delete);
        tripRepository.delete(trip);
    }

    private void applyRequest(TripRequest request, Trip trip, Authentication authentication) {
        trip.setCustomer(resolveCustomer(request.customerId(), authentication));
        trip.setVeiculo(resolveVeiculo(request.veiculoId(), authentication));
        trip.setTripType(request.tripType());
        trip.setStatus(request.status());
        trip.setOrigin(request.origin());
        trip.setDestination(request.destination());
        trip.setAppPlatform(request.appPlatform());
        trip.setStartAt(request.startAt());
        trip.setEndAt(request.endAt());
        trip.setDistanceKm(request.distanceKm());
        trip.setEstimatedAmount(request.estimatedAmount());
        trip.setActualAmount(request.actualAmount());
        trip.setTollAmount(request.tollAmount());
        trip.setFuelType(request.fuelType());
        trip.setFuelPrice(request.fuelPrice());
        trip.setFuelEfficiencyKmLiter(request.fuelEfficiencyKmLiter());
        trip.setNotes(request.notes());
    }

    private Customer resolveCustomer(Long customerId, Authentication authentication) {
        if (customerId == null) {
            return null;
        }
        AppUser authenticatedUser = planAccessService.getAuthenticatedUser(authentication);
        if (authenticatedUser.getRole() == UserRole.ADMINISTRADOR) {
            return customerRepository.findById(customerId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid customerId"));
        }
        return customerRepository.findByIdAndOwnerUserId(customerId, authenticatedUser.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid customerId"));
    }

    private Veiculo resolveVeiculo(Long veiculoId, Authentication authentication) {
        AppUser authenticatedUser = planAccessService.getAuthenticatedUser(authentication);
        if (authenticatedUser.getRole() == UserRole.ADMINISTRADOR) {
            return veiculoRepository.findById(veiculoId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid veiculoId"));
        }
        return veiculoRepository.findByIdAndDonoVeiculoId(veiculoId, authenticatedUser.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid veiculoId"));
    }

    private Trip resolveTrip(Long id, Authentication authentication) {
        AppUser authenticatedUser = planAccessService.getAuthenticatedUser(authentication);
        if (authenticatedUser.getRole() == UserRole.ADMINISTRADOR) {
            return tripRepository.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found"));
        }
        return tripRepository.findByIdAndVeiculoDonoVeiculoId(id, authenticatedUser.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found"));
    }

    private TripResponse toResponse(Trip trip) {
        Long customerId = trip.getCustomer() != null ? trip.getCustomer().getId() : null;
        String customerName = trip.getCustomer() != null ? trip.getCustomer().getName() : null;
        Long veiculoId = trip.getVeiculo() != null ? trip.getVeiculo().getId() : null;
        String veiculoPlaca = trip.getVeiculo() != null ? trip.getVeiculo().getPlaca() : null;
        String veiculoModelo = trip.getVeiculo() != null ? trip.getVeiculo().getModelo() : null;
        return new TripResponse(
                trip.getId(),
                customerId,
                customerName,
                veiculoId,
                veiculoPlaca,
                veiculoModelo,
                trip.getTripType(),
                trip.getStatus(),
                trip.getOrigin(),
                trip.getDestination(),
                trip.getAppPlatform(),
                trip.getStartAt(),
                trip.getEndAt(),
                trip.getDistanceKm(),
                trip.getEstimatedAmount(),
                trip.getActualAmount(),
                trip.getTollAmount(),
                trip.getFuelType(),
                trip.getFuelPrice(),
                trip.getFuelEfficiencyKmLiter(),
                trip.getNotes(),
                trip.getCreatedAt()
        );
    }

    private void sincronizarAgendamentoAutomatico(Trip trip) {
        AppUser motorista = trip.getVeiculo() != null ? trip.getVeiculo().getDonoVeiculo() : null;
        if (motorista == null || motorista.getRole() != UserRole.MOTORISTA) {
            return;
        }

        ConfiguracaoUsuario config = configuracaoUsuarioRepository.findByUsuarioId(motorista.getId())
                .orElseGet(() -> criarConfiguracaoDefault(motorista));
        if (!config.isSincronizarCalendario()) {
            return;
        }

        OffsetDateTime now = OffsetDateTime.now();
        AgendamentoViagem agendamento = agendamentoRepository.findByTripId(trip.getId()).orElseGet(AgendamentoViagem::new);
        if (agendamento.getId() == null) {
            agendamento.setCriadoEm(now);
        }
        agendamento.setTrip(trip);
        agendamento.setUsuario(motorista);
        agendamento.setTitulo("Viagem: " + trip.getOrigin() + " -> " + trip.getDestination());
        agendamento.setDescricao("Tipo: " + trip.getTripType().name());
        agendamento.setLocalEvento(trip.getDestination());
        agendamento.setInicioEm(trip.getStartAt());
        agendamento.setFimEm(trip.getEndAt());
        agendamento.setFusoHorario(config.getFusoHorario());
        agendamento.setLembreteMinutos(config.isLembreteAtivo() ? config.getMinutosAntecedenciaLembrete() : null);
        agendamento.setStatus(StatusAgendamento.AGENDADO);
        agendamento.setAtualizadoEm(now);
        agendamentoRepository.save(agendamento);
    }

    private ConfiguracaoUsuario criarConfiguracaoDefault(AppUser usuario) {
        ConfiguracaoUsuario config = new ConfiguracaoUsuario();
        config.setUsuario(usuario);
        config.setSincronizarCalendario(true);
        config.setLembreteAtivo(true);
        config.setMinutosAntecedenciaLembrete(30);
        config.setFusoHorario("America/Sao_Paulo");
        config.setDepreciacaoModo(DepreciacaoModo.MANUAL);
        config.setDepreciacaoAlocacao(DepreciacaoAlocacao.POR_KM);
        config.setValorManualPorKm(new BigDecimal("0.18"));
        return configuracaoUsuarioRepository.save(config);
    }

    private void sincronizarDespesaPedagio(Trip trip) {
        if (trip.getStatus() != TripStatus.CONCLUIDA) {
            return;
        }

        BigDecimal tollAmount = trip.getTollAmount();
        if (tollAmount == null || tollAmount.compareTo(BigDecimal.ZERO) <= 0 || trip.getVeiculo() == null) {
            return;
        }

        Expense expense = expenseRepository.findByTripId(trip.getId()).stream()
                .filter(existingExpense -> existingExpense.getCategory() == ExpenseCategory.PEDAGIO)
                .findFirst()
                .orElseGet(Expense::new);

        expense.setTrip(trip);
        expense.setVeiculo(trip.getVeiculo());
        expense.setCategory(ExpenseCategory.PEDAGIO);
        expense.setAmount(tollAmount);
        expense.setDescription("Pedagio gerado automaticamente ao concluir corrida");
        expense.setOccurredAt(trip.getEndAt() != null ? trip.getEndAt() : trip.getStartAt());
        expenseRepository.save(expense);
    }
}
