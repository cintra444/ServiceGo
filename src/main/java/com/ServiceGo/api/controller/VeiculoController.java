package com.ServiceGo.api.controller;

import com.ServiceGo.api.dto.veiculo.VeiculoRequest;
import com.ServiceGo.api.dto.veiculo.VeiculoResponse;
import com.ServiceGo.domain.entity.AppUser;
import com.ServiceGo.domain.entity.Veiculo;
import com.ServiceGo.domain.enums.UserRole;
import com.ServiceGo.domain.repository.AppUserRepository;
import com.ServiceGo.domain.repository.VeiculoRepository;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Locale;
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
@RequestMapping("/api/veiculos")
public class VeiculoController {

    private final VeiculoRepository veiculoRepository;
    private final AppUserRepository appUserRepository;

    public VeiculoController(VeiculoRepository veiculoRepository, AppUserRepository appUserRepository) {
        this.veiculoRepository = veiculoRepository;
        this.appUserRepository = appUserRepository;
    }

    @GetMapping
    public List<VeiculoResponse> list() {
        return veiculoRepository.findAll().stream().map(this::toResponse).toList();
    }

    @GetMapping("/{id}")
    public VeiculoResponse getById(@PathVariable Long id) {
        Veiculo veiculo = veiculoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Veiculo nao encontrado"));
        return toResponse(veiculo);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VeiculoResponse create(@Valid @RequestBody VeiculoRequest request) {
        String placa = request.placa().trim().toUpperCase(Locale.ROOT);
        if (veiculoRepository.existsByPlacaIgnoreCase(placa)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Placa ja cadastrada");
        }

        Veiculo veiculo = new Veiculo();
        applyRequest(request, veiculo);
        veiculo.setPlaca(placa);
        return toResponse(veiculoRepository.save(veiculo));
    }

    @PutMapping("/{id}")
    public VeiculoResponse update(@PathVariable Long id, @Valid @RequestBody VeiculoRequest request) {
        Veiculo veiculo = veiculoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Veiculo nao encontrado"));
        String placa = request.placa().trim().toUpperCase(Locale.ROOT);
        if (!placa.equalsIgnoreCase(veiculo.getPlaca()) && veiculoRepository.existsByPlacaIgnoreCase(placa)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Placa ja cadastrada");
        }
        applyRequest(request, veiculo);
        veiculo.setPlaca(placa);
        return toResponse(veiculoRepository.save(veiculo));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!veiculoRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Veiculo nao encontrado");
        }
        veiculoRepository.deleteById(id);
    }

    private void applyRequest(VeiculoRequest request, Veiculo veiculo) {
        veiculo.setModelo(request.modelo().trim());
        veiculo.setAno(request.ano());
        veiculo.setCor(request.cor() == null ? null : request.cor().trim());
        veiculo.setAtivo(request.ativo());
        veiculo.setKmAtual(request.kmAtual());
        veiculo.setDonoVeiculo(resolveMotorista(request.donoUsuarioId()));
    }

    private AppUser resolveMotorista(Long donoUsuarioId) {
        AppUser user = appUserRepository.findById(donoUsuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "donoUsuarioId invalido"));
        if (user.getRole() != UserRole.MOTORISTA) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dono do veiculo deve ser MOTORISTA");
        }
        return user;
    }

    private VeiculoResponse toResponse(Veiculo veiculo) {
        Long donoUsuarioId = veiculo.getDonoVeiculo() != null ? veiculo.getDonoVeiculo().getId() : null;
        String donoNome = veiculo.getDonoVeiculo() != null ? veiculo.getDonoVeiculo().getName() : null;
        return new VeiculoResponse(
                veiculo.getId(),
                veiculo.getModelo(),
                veiculo.getPlaca(),
                veiculo.getAno(),
                veiculo.getCor(),
                veiculo.isAtivo(),
                veiculo.getKmAtual(),
                donoUsuarioId,
                donoNome
        );
    }
}
