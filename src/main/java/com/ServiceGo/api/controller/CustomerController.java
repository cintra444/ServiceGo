package com.ServiceGo.api.controller;

import com.ServiceGo.api.dto.customer.CustomerRequest;
import com.ServiceGo.api.dto.customer.CustomerResponse;
import com.ServiceGo.domain.entity.Customer;
import com.ServiceGo.domain.repository.CustomerRepository;
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
@RequestMapping("/api/customers")
@Deprecated
public class CustomerController {

    private final CustomerRepository customerRepository;

    public CustomerController(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @GetMapping
    public List<CustomerResponse> list() {
        return customerRepository.findAll().stream().map(customer -> new CustomerResponse(
                customer.getId(),
                customer.getName(),
                customer.getPhone(),
                customer.getEmail(),
                customer.getNotes(),
                customer.getCreatedAt()
        )).toList();
    }

    @GetMapping("/{id}")
    public CustomerResponse getById(@PathVariable Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));
        return new CustomerResponse(
                customer.getId(),
                customer.getName(),
                customer.getPhone(),
                customer.getEmail(),
                customer.getNotes(),
                customer.getCreatedAt()
        );
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CustomerResponse create(@Valid @RequestBody CustomerRequest request) {
        Customer customer = new Customer();
        customer.setName(request.name());
        customer.setPhone(request.phone());
        customer.setEmail(request.email());
        customer.setNotes(request.notes());
        customer.setCreatedAt(OffsetDateTime.now());

        Customer saved = customerRepository.save(customer);
        return new CustomerResponse(
                saved.getId(),
                saved.getName(),
                saved.getPhone(),
                saved.getEmail(),
                saved.getNotes(),
                saved.getCreatedAt()
        );
    }

    @PutMapping("/{id}")
    public CustomerResponse update(@PathVariable Long id, @Valid @RequestBody CustomerRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));
        customer.setName(request.name());
        customer.setPhone(request.phone());
        customer.setEmail(request.email());
        customer.setNotes(request.notes());

        Customer saved = customerRepository.save(customer);
        return new CustomerResponse(
                saved.getId(),
                saved.getName(),
                saved.getPhone(),
                saved.getEmail(),
                saved.getNotes(),
                saved.getCreatedAt()
        );
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!customerRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found");
        }
        customerRepository.deleteById(id);
    }
}
