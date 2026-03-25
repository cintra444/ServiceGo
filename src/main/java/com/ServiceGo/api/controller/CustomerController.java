package com.ServiceGo.api.controller;

import com.ServiceGo.api.dto.customer.CustomerRequest;
import com.ServiceGo.api.dto.customer.CustomerResponse;
import com.ServiceGo.domain.entity.AppUser;
import com.ServiceGo.domain.entity.Customer;
import com.ServiceGo.domain.repository.CustomerRepository;
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
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerRepository customerRepository;
    private final PlanAccessService planAccessService;

    public CustomerController(CustomerRepository customerRepository, PlanAccessService planAccessService) {
        this.customerRepository = customerRepository;
        this.planAccessService = planAccessService;
    }

    @GetMapping
    public List<CustomerResponse> list(Authentication authentication) {
        AppUser authenticatedUser = planAccessService.getAuthenticatedUser(authentication);
        List<Customer> customers = authenticatedUser.getRole() == com.ServiceGo.domain.enums.UserRole.ADMINISTRADOR
                ? customerRepository.findAll()
                : customerRepository.findByOwnerUserIdOrderByNameAsc(authenticatedUser.getId());
        return customers.stream().map(this::toResponse).toList();
    }

    @GetMapping("/{id}")
    public CustomerResponse getById(@PathVariable Long id, Authentication authentication) {
        Customer customer = resolveCustomer(id, authentication);
        return toResponse(customer);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CustomerResponse create(@Valid @RequestBody CustomerRequest request, Authentication authentication) {
        AppUser authenticatedUser = planAccessService.getAuthenticatedUser(authentication);
        Customer customer = new Customer();
        customer.setName(request.name());
        customer.setPhone(request.phone());
        customer.setEmail(request.email());
        customer.setNotes(request.notes());
        customer.setCreatedAt(OffsetDateTime.now());
        customer.setOwnerUser(authenticatedUser);
        return toResponse(customerRepository.save(customer));
    }

    @PutMapping("/{id}")
    public CustomerResponse update(@PathVariable Long id, @Valid @RequestBody CustomerRequest request, Authentication authentication) {
        Customer customer = resolveCustomer(id, authentication);
        customer.setName(request.name());
        customer.setPhone(request.phone());
        customer.setEmail(request.email());
        customer.setNotes(request.notes());
        return toResponse(customerRepository.save(customer));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication authentication) {
        Customer customer = resolveCustomer(id, authentication);
        customerRepository.delete(customer);
    }

    private Customer resolveCustomer(Long id, Authentication authentication) {
        AppUser authenticatedUser = planAccessService.getAuthenticatedUser(authentication);
        if (authenticatedUser.getRole() == com.ServiceGo.domain.enums.UserRole.ADMINISTRADOR) {
            return customerRepository.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));
        }
        return customerRepository.findByIdAndOwnerUserId(id, authenticatedUser.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));
    }

    private CustomerResponse toResponse(Customer customer) {
        return new CustomerResponse(
                customer.getId(),
                customer.getName(),
                customer.getPhone(),
                customer.getEmail(),
                customer.getNotes(),
                customer.getCreatedAt()
        );
    }
}
