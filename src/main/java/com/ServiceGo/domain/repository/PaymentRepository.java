package com.ServiceGo.domain.repository;

import com.ServiceGo.domain.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    java.util.List<Payment> findByTripId(Long tripId);
}
