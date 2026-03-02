package com.ServiceGo.domain.repository;

import com.ServiceGo.domain.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TripRepository extends JpaRepository<Trip, Long> {
}
