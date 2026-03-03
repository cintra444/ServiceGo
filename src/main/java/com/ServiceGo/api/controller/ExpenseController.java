package com.ServiceGo.api.controller;

import com.ServiceGo.api.dto.expense.ExpenseRequest;
import com.ServiceGo.api.dto.expense.ExpenseResponse;
import com.ServiceGo.domain.entity.Expense;
import com.ServiceGo.domain.entity.Trip;
import com.ServiceGo.domain.entity.Veiculo;
import com.ServiceGo.domain.repository.ExpenseRepository;
import com.ServiceGo.domain.repository.TripRepository;
import com.ServiceGo.domain.repository.VeiculoRepository;
import jakarta.validation.Valid;
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
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseRepository expenseRepository;
    private final TripRepository tripRepository;
    private final VeiculoRepository veiculoRepository;

    public ExpenseController(
            ExpenseRepository expenseRepository,
            TripRepository tripRepository,
            VeiculoRepository veiculoRepository
    ) {
        this.expenseRepository = expenseRepository;
        this.tripRepository = tripRepository;
        this.veiculoRepository = veiculoRepository;
    }

    @GetMapping
    public List<ExpenseResponse> list() {
        return expenseRepository.findAll().stream().map(this::toResponse).toList();
    }

    @GetMapping("/{id}")
    public ExpenseResponse getById(@PathVariable Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Expense not found"));
        return toResponse(expense);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ExpenseResponse create(@Valid @RequestBody ExpenseRequest request) {
        Expense expense = new Expense();
        applyRequest(request, expense);
        return toResponse(expenseRepository.save(expense));
    }

    @PutMapping("/{id}")
    public ExpenseResponse update(@PathVariable Long id, @Valid @RequestBody ExpenseRequest request) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Expense not found"));
        applyRequest(request, expense);
        return toResponse(expenseRepository.save(expense));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!expenseRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Expense not found");
        }
        expenseRepository.deleteById(id);
    }

    private void applyRequest(ExpenseRequest request, Expense expense) {
        expense.setTrip(resolveTrip(request.tripId()));
        expense.setVeiculo(resolveVeiculo(request.veiculoId()));
        expense.setCategory(request.category());
        expense.setAmount(request.amount());
        expense.setDescription(request.description());
        expense.setOccurredAt(request.occurredAt());
    }

    private Trip resolveTrip(Long tripId) {
        if (tripId == null) {
            return null;
        }
        return tripRepository.findById(tripId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid tripId"));
    }

    private Veiculo resolveVeiculo(Long veiculoId) {
        return veiculoRepository.findById(veiculoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid veiculoId"));
    }

    private ExpenseResponse toResponse(Expense expense) {
        Long tripId = expense.getTrip() != null ? expense.getTrip().getId() : null;
        Long veiculoId = expense.getVeiculo() != null ? expense.getVeiculo().getId() : null;
        String veiculoPlaca = expense.getVeiculo() != null ? expense.getVeiculo().getPlaca() : null;
        return new ExpenseResponse(
                expense.getId(),
                tripId,
                veiculoId,
                veiculoPlaca,
                expense.getCategory(),
                expense.getAmount(),
                expense.getDescription(),
                expense.getOccurredAt()
        );
    }
}
