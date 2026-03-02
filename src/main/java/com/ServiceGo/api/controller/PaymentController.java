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
@Deprecated
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
        return paymentRepository.findAll().stream().map(payment -> {
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
        }).toList();
    }

    @GetMapping("/{id}")
    public PaymentResponse getById(@PathVariable Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found"));
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

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentResponse create(@Valid @RequestBody PaymentRequest request) {
        Payment payment = new Payment();
        Trip trip = null;
        if (request.tripId() != null) {
            trip = tripRepository.findById(request.tripId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid tripId"));
        }
        Customer customer = null;
        if (request.customerId() != null) {
            customer = customerRepository.findById(request.customerId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid customerId"));
        }
        payment.setTrip(trip);
        payment.setCustomer(customer);
        payment.setMethod(request.method());
        payment.setStatus(request.status());
        payment.setAmount(request.amount());
        payment.setPaidAt(request.paidAt());
        payment.setDueAt(request.dueAt());
        payment.setReferenceCode(request.referenceCode());
        payment.setNotes(request.notes());

        Payment saved = paymentRepository.save(payment);
        Long tripId = saved.getTrip() != null ? saved.getTrip().getId() : null;
        Long customerId = saved.getCustomer() != null ? saved.getCustomer().getId() : null;
        return new PaymentResponse(
                saved.getId(),
                tripId,
                customerId,
                saved.getMethod(),
                saved.getStatus(),
                saved.getAmount(),
                saved.getPaidAt(),
                saved.getDueAt(),
                saved.getReferenceCode(),
                saved.getNotes()
        );
    }

    @PutMapping("/{id}")
    public PaymentResponse update(@PathVariable Long id, @Valid @RequestBody PaymentRequest request) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found"));

        Trip trip = null;
        if (request.tripId() != null) {
            trip = tripRepository.findById(request.tripId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid tripId"));
        }
        Customer customer = null;
        if (request.customerId() != null) {
            customer = customerRepository.findById(request.customerId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid customerId"));
        }
        payment.setTrip(trip);
        payment.setCustomer(customer);
        payment.setMethod(request.method());
        payment.setStatus(request.status());
        payment.setAmount(request.amount());
        payment.setPaidAt(request.paidAt());
        payment.setDueAt(request.dueAt());
        payment.setReferenceCode(request.referenceCode());
        payment.setNotes(request.notes());

        Payment saved = paymentRepository.save(payment);
        Long tripId = saved.getTrip() != null ? saved.getTrip().getId() : null;
        Long customerId = saved.getCustomer() != null ? saved.getCustomer().getId() : null;
        return new PaymentResponse(
                saved.getId(),
                tripId,
                customerId,
                saved.getMethod(),
                saved.getStatus(),
                saved.getAmount(),
                saved.getPaidAt(),
                saved.getDueAt(),
                saved.getReferenceCode(),
                saved.getNotes()
        );
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!paymentRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found");
        }
        paymentRepository.deleteById(id);
    }
}
