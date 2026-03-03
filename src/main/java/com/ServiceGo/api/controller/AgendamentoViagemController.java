package com.ServiceGo.api.controller;

import com.ServiceGo.api.dto.agendamento.AgendamentoViagemRequest;
import com.ServiceGo.api.dto.agendamento.AgendamentoViagemResponse;
import com.ServiceGo.domain.entity.AgendamentoViagem;
import com.ServiceGo.domain.entity.AppUser;
import com.ServiceGo.domain.entity.Trip;
import com.ServiceGo.domain.repository.AgendamentoViagemRepository;
import com.ServiceGo.domain.repository.AppUserRepository;
import com.ServiceGo.domain.repository.TripRepository;
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
@RequestMapping("/api/agendamentos")
public class AgendamentoViagemController {

    private final AgendamentoViagemRepository agendamentoRepository;
    private final TripRepository tripRepository;
    private final AppUserRepository appUserRepository;

    public AgendamentoViagemController(
            AgendamentoViagemRepository agendamentoRepository,
            TripRepository tripRepository,
            AppUserRepository appUserRepository
    ) {
        this.agendamentoRepository = agendamentoRepository;
        this.tripRepository = tripRepository;
        this.appUserRepository = appUserRepository;
    }

    @GetMapping
    public List<AgendamentoViagemResponse> list() {
        return agendamentoRepository.findAll().stream().map(this::toResponse).toList();
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<AgendamentoViagemResponse> listByUsuario(@PathVariable Long usuarioId) {
        return agendamentoRepository.findByUsuarioIdOrderByInicioEmAsc(usuarioId).stream().map(this::toResponse).toList();
    }

    @GetMapping("/{id}")
    public AgendamentoViagemResponse getById(@PathVariable Long id) {
        AgendamentoViagem agendamento = agendamentoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agendamento nao encontrado"));
        return toResponse(agendamento);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AgendamentoViagemResponse create(@Valid @RequestBody AgendamentoViagemRequest request) {
        AgendamentoViagem agendamento = new AgendamentoViagem();
        applyRequest(request, agendamento);
        OffsetDateTime now = OffsetDateTime.now();
        agendamento.setCriadoEm(now);
        agendamento.setAtualizadoEm(now);
        return toResponse(agendamentoRepository.save(agendamento));
    }

    @PutMapping("/{id}")
    public AgendamentoViagemResponse update(@PathVariable Long id, @Valid @RequestBody AgendamentoViagemRequest request) {
        AgendamentoViagem agendamento = agendamentoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agendamento nao encontrado"));
        applyRequest(request, agendamento);
        agendamento.setAtualizadoEm(OffsetDateTime.now());
        return toResponse(agendamentoRepository.save(agendamento));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!agendamentoRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Agendamento nao encontrado");
        }
        agendamentoRepository.deleteById(id);
    }

    private void applyRequest(AgendamentoViagemRequest request, AgendamentoViagem agendamento) {
        agendamento.setTrip(resolveTrip(request.tripId()));
        agendamento.setUsuario(resolveUsuario(request.usuarioId()));
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

    private Trip resolveTrip(Long tripId) {
        return tripRepository.findById(tripId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "tripId invalido"));
    }

    private AppUser resolveUsuario(Long usuarioId) {
        return appUserRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "usuarioId invalido"));
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
