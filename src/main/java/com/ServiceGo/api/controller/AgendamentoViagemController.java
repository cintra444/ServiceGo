package com.ServiceGo.api.controller;

import com.ServiceGo.api.dto.agendamento.AgendamentoViagemRequest;
import com.ServiceGo.api.dto.agendamento.AgendamentoViagemResponse;
import com.ServiceGo.domain.entity.AgendamentoViagem;
import com.ServiceGo.domain.entity.AppUser;
import com.ServiceGo.domain.entity.Trip;
import com.ServiceGo.domain.enums.UserRole;
import com.ServiceGo.domain.repository.AgendamentoViagemRepository;
import com.ServiceGo.domain.repository.AppUserRepository;
import com.ServiceGo.domain.repository.TripRepository;
import com.ServiceGo.security.PlanAccessService;
import jakarta.validation.Valid;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
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
@RequestMapping("/api/agendamentos")
public class AgendamentoViagemController {

    private final AgendamentoViagemRepository agendamentoRepository;
    private final TripRepository tripRepository;
    private final AppUserRepository appUserRepository;
    private final PlanAccessService planAccessService;

    public AgendamentoViagemController(
            AgendamentoViagemRepository agendamentoRepository,
            TripRepository tripRepository,
            AppUserRepository appUserRepository,
            PlanAccessService planAccessService
    ) {
        this.agendamentoRepository = agendamentoRepository;
        this.tripRepository = tripRepository;
        this.appUserRepository = appUserRepository;
        this.planAccessService = planAccessService;
    }

    @GetMapping
    public List<AgendamentoViagemResponse> list(Authentication authentication) {
        AppUser authenticatedUser = planAccessService.getAuthenticatedUser(authentication);
        List<AgendamentoViagem> agendamentos = authenticatedUser.getRole() == UserRole.ADMINISTRADOR
                ? agendamentoRepository.findAll()
                : agendamentoRepository.findByUsuarioIdOrderByInicioEmDesc(authenticatedUser.getId());
        return agendamentos.stream().map(this::toResponse).toList();
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<AgendamentoViagemResponse> listByUsuario(@PathVariable Long usuarioId, Authentication authentication) {
        planAccessService.ensureUserCanAccess(usuarioId, authentication);
        return agendamentoRepository.findByUsuarioIdOrderByInicioEmAsc(usuarioId).stream().map(this::toResponse).toList();
    }

    @GetMapping("/{id}")
    public AgendamentoViagemResponse getById(@PathVariable Long id, Authentication authentication) {
        AgendamentoViagem agendamento = resolveAgendamento(id, authentication);
        return toResponse(agendamento);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AgendamentoViagemResponse create(@Valid @RequestBody AgendamentoViagemRequest request, Authentication authentication) {
        AgendamentoViagem agendamento = new AgendamentoViagem();
        applyRequest(request, agendamento, authentication);
        OffsetDateTime now = OffsetDateTime.now();
        agendamento.setCriadoEm(now);
        agendamento.setAtualizadoEm(now);
        return toResponse(agendamentoRepository.save(agendamento));
    }

    @PutMapping("/{id}")
    public AgendamentoViagemResponse update(@PathVariable Long id, @Valid @RequestBody AgendamentoViagemRequest request, Authentication authentication) {
        AgendamentoViagem agendamento = resolveAgendamento(id, authentication);
        applyRequest(request, agendamento, authentication);
        agendamento.setAtualizadoEm(OffsetDateTime.now());
        return toResponse(agendamentoRepository.save(agendamento));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication authentication) {
        AgendamentoViagem agendamento = resolveAgendamento(id, authentication);
        agendamentoRepository.delete(agendamento);
    }

    private void applyRequest(AgendamentoViagemRequest request, AgendamentoViagem agendamento, Authentication authentication) {
        AppUser authenticatedUser = planAccessService.getAuthenticatedUser(authentication);
        Long usuarioId = authenticatedUser.getRole() == UserRole.ADMINISTRADOR ? request.usuarioId() : authenticatedUser.getId();
        agendamento.setTrip(resolveTrip(request.tripId(), authentication));
        agendamento.setUsuario(resolveUsuario(usuarioId, authentication));
        agendamento.setTitulo(request.titulo().trim());
        agendamento.setDescricao(request.descricao() == null ? null : request.descricao().trim());
        agendamento.setLocalEvento(request.localEvento() == null ? null : request.localEvento().trim());
        agendamento.setInicioEm(request.inicioEm());
        agendamento.setFimEm(request.fimEm());
        agendamento.setFusoHorario(request.fusoHorario().trim());
        agendamento.setLembreteMinutos(request.lembreteMinutos());
        agendamento.setIdEventoExterno(request.idEventoExterno());
        agendamento.setStatus(request.status());
    }

    private Trip resolveTrip(Long tripId, Authentication authentication) {
        AppUser authenticatedUser = planAccessService.getAuthenticatedUser(authentication);
        if (authenticatedUser.getRole() == UserRole.ADMINISTRADOR) {
            return tripRepository.findById(tripId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "tripId invalido"));
        }
        return tripRepository.findByIdAndVeiculoDonoVeiculoId(tripId, authenticatedUser.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "tripId invalido"));
    }

    private AppUser resolveUsuario(Long usuarioId, Authentication authentication) {
        planAccessService.ensureUserCanAccess(usuarioId, authentication);
        return appUserRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "usuarioId invalido"));
    }

    private AgendamentoViagem resolveAgendamento(Long id, Authentication authentication) {
        AppUser authenticatedUser = planAccessService.getAuthenticatedUser(authentication);
        if (authenticatedUser.getRole() == UserRole.ADMINISTRADOR) {
            return agendamentoRepository.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agendamento nao encontrado"));
        }
        return agendamentoRepository.findByIdAndUsuarioId(id, authenticatedUser.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agendamento nao encontrado"));
    }

    private AgendamentoViagemResponse toResponse(AgendamentoViagem agendamento) {
        Long tripId = agendamento.getTrip() != null ? agendamento.getTrip().getId() : null;
        Long usuarioId = agendamento.getUsuario() != null ? agendamento.getUsuario().getId() : null;
        String usuarioNome = agendamento.getUsuario() != null ? agendamento.getUsuario().getName() : null;
        return new AgendamentoViagemResponse(
                agendamento.getId(),
                tripId,
                usuarioId,
                usuarioNome,
                agendamento.getTitulo(),
                agendamento.getDescricao(),
                agendamento.getLocalEvento(),
                agendamento.getInicioEm(),
                agendamento.getFimEm(),
                agendamento.getFusoHorario(),
                agendamento.getLembreteMinutos(),
                agendamento.getIdEventoExterno(),
                agendamento.getStatus(),
                agendamento.getCriadoEm(),
                agendamento.getAtualizadoEm()
        );
    }
}
