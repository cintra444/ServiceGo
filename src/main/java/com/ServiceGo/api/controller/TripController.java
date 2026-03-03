package com.ServiceGo.api.controller;

import com.ServiceGo.api.dto.trip.TripRequest;
import com.ServiceGo.api.dto.trip.TripResponse;
import com.ServiceGo.domain.entity.AgendamentoViagem;
import com.ServiceGo.domain.entity.ConfiguracaoUsuario;
import com.ServiceGo.domain.entity.Customer;
import com.ServiceGo.domain.entity.Trip;
import com.ServiceGo.domain.entity.AppUser;
import com.ServiceGo.domain.entity.Veiculo;
import com.ServiceGo.domain.enums.StatusAgendamento;
import com.ServiceGo.domain.enums.UserRole;
import com.ServiceGo.domain.repository.AgendamentoViagemRepository;
import com.ServiceGo.domain.repository.ConfiguracaoUsuarioRepository;
import com.ServiceGo.domain.repository.CustomerRepository;
import com.ServiceGo.domain.repository.TripRepository;
import com.ServiceGo.domain.repository.VeiculoRepository;
import jakarta.validation.Valid;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;
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

    public TripController(
            TripRepository tripRepository,
            CustomerRepository customerRepository,
            VeiculoRepository veiculoRepository,
            AgendamentoViagemRepository agendamentoRepository,
            ConfiguracaoUsuarioRepository configuracaoUsuarioRepository
    ) {
        this.tripRepository = tripRepository;
        this.customerRepository = customerRepository;
        this.veiculoRepository = veiculoRepository;
        this.agendamentoRepository = agendamentoRepository;
        this.configuracaoUsuarioRepository = configuracaoUsuarioRepository;
    }

    @GetMapping
    public List<TripResponse> list() {
        return tripRepository.findAll().stream().map(this::toResponse).toList();
    }

    @GetMapping("/{id}")
    public TripResponse getById(@PathVariable Long id) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found"));
        return toResponse(trip);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TripResponse create(@Valid @RequestBody TripRequest request) {
        Trip trip = new Trip();
        applyRequest(request, trip);
        trip.setCreatedAt(OffsetDateTime.now());
        Trip saved = tripRepository.save(trip);
        sincronizarAgendamentoAutomatico(saved);
        return toResponse(saved);
    }

    @PutMapping("/{id}")
    public TripResponse update(@PathVariable Long id, @Valid @RequestBody TripRequest request) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found"));
        applyRequest(request, trip);
        Trip saved = tripRepository.save(trip);
        sincronizarAgendamentoAutomatico(saved);
        return toResponse(saved);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!tripRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found");
        }
        agendamentoRepository.findByTripId(id).ifPresent(agendamento -> {
            agendamento.setStatus(StatusAgendamento.CANCELADO);
            agendamento.setAtualizadoEm(OffsetDateTime.now());
            agendamentoRepository.save(agendamento);
        });
        tripRepository.deleteById(id);
    }

    private void applyRequest(TripRequest request, Trip trip) {
        trip.setCustomer(resolveCustomer(request.customerId()));
        trip.setVeiculo(resolveVeiculo(request.veiculoId()));
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
        trip.setNotes(request.notes());
    }

    private Customer resolveCustomer(Long customerId) {
        if (customerId == null) {
            return null;
        }
        return customerRepository.findById(customerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid customerId"));
    }

    private Veiculo resolveVeiculo(Long veiculoId) {
        return veiculoRepository.findById(veiculoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid veiculoId"));
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
        return configuracaoUsuarioRepository.save(config);
    }
}
