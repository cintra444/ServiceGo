package com.ServiceGo.domain.repository;

import com.ServiceGo.domain.entity.Payment;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    @Override
    @EntityGraph(attributePaths = {"trip", "customer", "ownerUser"})
    List<Payment> findAll();

    @Override
    @EntityGraph(attributePaths = {"trip", "customer", "ownerUser"})
    Optional<Payment> findById(Long id);

    @EntityGraph(attributePaths = {"trip", "customer", "ownerUser"})
    List<Payment> findByTripId(Long tripId);

    @EntityGraph(attributePaths = {"trip", "customer", "ownerUser"})
    List<Payment> findByOwnerUserIdOrderByIdDesc(Long ownerUserId);

    @EntityGraph(attributePaths = {"trip", "customer", "ownerUser"})
    List<Payment> findByTripIdAndOwnerUserId(Long tripId, Long ownerUserId);

    @EntityGraph(attributePaths = {"trip", "customer", "ownerUser"})
    Optional<Payment> findByIdAndOwnerUserId(Long id, Long ownerUserId);
}
