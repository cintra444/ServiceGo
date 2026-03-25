package com.ServiceGo.domain.repository;

import com.ServiceGo.domain.entity.Customer;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    List<Customer> findByOwnerUserIdOrderByNameAsc(Long ownerUserId);

    Optional<Customer> findByIdAndOwnerUserId(Long id, Long ownerUserId);
}
