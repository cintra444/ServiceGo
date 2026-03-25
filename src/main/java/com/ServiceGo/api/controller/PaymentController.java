package com.ServiceGo.api.controller;

import com.ServiceGo.api.dto.payment.PaymentRequest;
import com.ServiceGo.api.dto.payment.PaymentResponse;
import com.ServiceGo.domain.entity.AppUser;
import com.ServiceGo.domain.entity.Customer;
import com.ServiceGo.domain.entity.Payment;
import com.ServiceGo.domain.entity.Trip;
import com.ServiceGo.domain.enums.UserRole;
import com.ServiceGo.domain.repository.CustomerRepository;
import com.ServiceGo.domain.repository.PaymentRepository;
import com.ServiceGo.domain.repository.TripRepository;
import com.ServiceGo.security.PlanAccessService;
import jakarta.validation.Valid;
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
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentRepository paymentRepository;
    private final TripRepository tripRepository;
    private final CustomerRepository customerRepository;
    private final PlanAccessService planAccessService;

    public PaymentController(
            PaymentRepository paymentRepository,
            TripRepository tripRepository,
            CustomerRepository customerRepository,
            PlanAccessService planAccessService
    ) {
        this.paymentRepository = paymentRepository;
        this.tripRepository = tripRepository;
        this.customerRepository = customerRepository;
        this.planAccessService = planAccessService;
    }

    @GetMapping
    public List<PaymentResponse> list(Authentication authentication) {
        AppUser authenticatedUser = planAccessService.getAuthenticatedUser(authentication);
        List<Payment> payments = authenticatedUser.getRole() == UserRole.ADMINISTRADOR
                ? paymentRepository.findAll()
                : paymentRepository.findByOwnerUserIdOrderByIdDesc(authenticatedUser.getId());
        return payments.stream().map(this::toResponse).toList();
    }

    @GetMapping("/trip/{tripId}")
    public List<PaymentResponse> listByTrip(@PathVariable Long tripId, Authentication authentication) {
        AppUser authenticatedUser = planAccessService.getAuthenticatedUser(authentication);
        List<Payment> payments = authenticatedUser.getRole() == UserRole.ADMINISTRADOR
                ? paymentRepository.findByTripId(tripId)
                : paymentRepository.findByTripIdAndOwnerUserId(tripId, authenticatedUser.getId());
        return payments.stream().map(this::toResponse).toList();
    }

    @GetMapping("/{id}")
    public PaymentResponse getById(@PathVariable Long id, Authentication authentication) {
        Payment payment = resolvePayment(id, authentication);
        return toResponse(payment);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentResponse create(@Valid @RequestBody PaymentRequest request, Authentication authentication) {
        Payment payment = new Payment();
        applyRequest(request, payment, authentication);
        payment.setOwnerUser(resolveOwnerUser(payment, authentication));
        return toResponse(paymentRepository.save(payment));
    }

    @PutMapping("/{id}")
    public PaymentResponse update(@PathVariable Long id, @Valid @RequestBody PaymentRequest request, Authentication authentication) {
        Payment payment = resolvePayment(id, authentication);
        applyRequest(request, payment, authentication);
        payment.setOwnerUser(resolveOwnerUser(payment, authentication));
        return toResponse(paymentRepository.save(payment));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication authentication) {
        Payment payment = resolvePayment(id, authentication);
        paymentRepository.delete(payment);
    }

    private void applyRequest(PaymentRequest request, Payment payment, Authentication authentication) {
        payment.setTrip(resolveTrip(request.tripId(), authentication));
        payment.setCustomer(resolveCustomer(request.customerId(), authentication));
        payment.setMethod(request.method());
        payment.setStatus(request.status());
        payment.setAmount(request.amount());
        payment.setPagamentoParcial(request.pagamentoParcial());
        payment.setNumeroParcela(request.numeroParcela());
        payment.setPaidAt(request.paidAt());
        payment.setDueAt(request.dueAt());
        payment.setReferenceCode(request.referenceCode());
        payment.setNotes(request.notes());
    }

    private Trip resolveTrip(Long tripId, Authentication authentication) {
        if (tripId == null) {
            return null;
        }
        AppUser authenticatedUser = planAccessService.getAuthenticatedUser(authentication);
        if (authenticatedUser.getRole() == UserRole.ADMINISTRADOR) {
            return tripRepository.findById(tripId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid tripId"));
        }
        return tripRepository.findByIdAndVeiculoDonoVeiculoId(tripId, authenticatedUser.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid tripId"));
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

    private Payment resolvePayment(Long id, Authentication authentication) {
        AppUser authenticatedUser = planAccessService.getAuthenticatedUser(authentication);
        if (authenticatedUser.getRole() == UserRole.ADMINISTRADOR) {
            return paymentRepository.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found"));
        }
        return paymentRepository.findByIdAndOwnerUserId(id, authenticatedUser.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found"));
    }

    private AppUser resolveOwnerUser(Payment payment, Authentication authentication) {
        if (payment.getTrip() != null && payment.getCustomer() != null) {
            AppUser tripOwner = payment.getTrip().getVeiculo() != null ? payment.getTrip().getVeiculo().getDonoVeiculo() : null;
            AppUser customerOwner = payment.getCustomer().getOwnerUser();
            if (tripOwner != null && customerOwner != null && !tripOwner.getId().equals(customerOwner.getId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trip e customer precisam pertencer ao mesmo motorista");
            }
        }
        if (payment.getTrip() != null && payment.getTrip().getVeiculo() != null) {
            return payment.getTrip().getVeiculo().getDonoVeiculo();
        }
        if (payment.getCustomer() != null) {
            return payment.getCustomer().getOwnerUser();
        }
        return planAccessService.getAuthenticatedUser(authentication);
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
                payment.isPagamentoParcial(),
                payment.getNumeroParcela(),
                payment.getPaidAt(),
                payment.getDueAt(),
                payment.getReferenceCode(),
                payment.getNotes()
        );
    }
}
