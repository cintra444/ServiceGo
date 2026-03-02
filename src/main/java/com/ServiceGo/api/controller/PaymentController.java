package com.ServiceGo.api.controller;

import com.ServiceGo.api.dto.payment.PaymentRequest;
import com.ServiceGo.api.dto.payment.PaymentResponse;
import com.ServiceGo.domain.entity.Customer;
import com.ServiceGo.domain.entity.Payment;
import com.ServiceGo.domain.entity.Trip;
import com.ServiceGo.domain.repository.CustomerRepository;
import com.ServiceGo.domain.repository.PaymentRepository;
import com.ServiceGo.domain.repository.TripRepository;
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
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentRepository paymentRepository;
    private final TripRepository tripRepository;
    private final CustomerRepository customerRepository;

    public PaymentController(
            PaymentRepository paymentRepository,
            TripRepository tripRepository,
            CustomerRepository customerRepository
    ) {
        this.paymentRepository = paymentRepository;
        this.tripRepository = tripRepository;
        this.customerRepository = customerRepository;
    }

    @GetMapping
    public List<PaymentResponse> list() {
        return paymentRepository.findAll().stream().map(this::toResponse).toList();
    }

    @GetMapping("/{id}")
    public PaymentResponse getById(@PathVariable Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found"));
        return toResponse(payment);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentResponse create(@Valid @RequestBody PaymentRequest request) {
        Payment payment = new Payment();
        applyRequest(request, payment);
        return toResponse(paymentRepository.save(payment));
    }

    @PutMapping("/{id}")
    public PaymentResponse update(@PathVariable Long id, @Valid @RequestBody PaymentRequest request) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found"));
        applyRequest(request, payment);
        return toResponse(paymentRepository.save(payment));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!paymentRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found");
        }
        paymentRepository.deleteById(id);
    }

    private void applyRequest(PaymentRequest request, Payment payment) {
        payment.setTrip(resolveTrip(request.tripId()));
        payment.setCustomer(resolveCustomer(request.customerId()));
        payment.setMethod(request.method());
        payment.setStatus(request.status());
        payment.setAmount(request.amount());
        payment.setPaidAt(request.paidAt());
        payment.setDueAt(request.dueAt());
        payment.setReferenceCode(request.referenceCode());
        payment.setNotes(request.notes());
    }

    private Trip resolveTrip(Long tripId) {
        if (tripId == null) {
            return null;
        }
        return tripRepository.findById(tripId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid tripId"));
    }

    private Customer resolveCustomer(Long customerId) {
        if (customerId == null) {
            return null;
        }
        return customerRepository.findById(customerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid customerId"));
    }

    private PaymentResponse toResponse(Payment payment) {
        Long tripId = payment.getTrip() != null ? payment.getTrip().getId() : null;
        Long customerId = payment.getCustomer() != null ? payment.getCustomer().getId() : null;
        return new PaymentResponse(
                payment.getId(),
                tripId,
                customerId,
                payment.getMethod(),
                payment.getStatus(),
                payment.getAmount(),
                payment.getPaidAt(),
                payment.getDueAt(),
                payment.getReferenceCode(),
                payment.getNotes()
        );
    }
}
