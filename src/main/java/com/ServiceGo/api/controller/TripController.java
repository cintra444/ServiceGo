package com.ServiceGo.api.controller;

import com.ServiceGo.api.dto.trip.TripRequest;
import com.ServiceGo.api.dto.trip.TripResponse;
import com.ServiceGo.domain.entity.Customer;
import com.ServiceGo.domain.entity.Trip;
import com.ServiceGo.domain.repository.CustomerRepository;
import com.ServiceGo.domain.repository.TripRepository;
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
@RequestMapping("/api/trips")
@Deprecated
public class TripController {

    private final TripRepository tripRepository;
    private final CustomerRepository customerRepository;

    public TripController(TripRepository tripRepository, CustomerRepository customerRepository) {
        this.tripRepository = tripRepository;
        this.customerRepository = customerRepository;
    }

    @GetMapping
    public List<TripResponse> list() {
        return tripRepository.findAll().stream().map(trip -> {
            Long customerId = trip.getCustomer() != null ? trip.getCustomer().getId() : null;
            String customerName = trip.getCustomer() != null ? trip.getCustomer().getName() : null;
            return new TripResponse(
                    trip.getId(),
                    customerId,
                    customerName,
                    trip.getTripType(),
                    trip.getStatus(),
                    trip.getOrigin(),
                    trip.getDestination(),
                    trip.getAppPlatform(),
                    trip.getStartAt(),
                    trip.getEndAt(),
                    trip.getDistanceKm(),
                    trip.getEstimatedAmount(),
                    trip.getActualAmount(),
                    trip.getNotes(),
                    trip.getCreatedAt()
            );
        }).toList();
    }

    @GetMapping("/{id}")
    public TripResponse getById(@PathVariable Long id) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found"));
        Long customerId = trip.getCustomer() != null ? trip.getCustomer().getId() : null;
        String customerName = trip.getCustomer() != null ? trip.getCustomer().getName() : null;
        return new TripResponse(
                trip.getId(),
                customerId,
                customerName,
                trip.getTripType(),
                trip.getStatus(),
                trip.getOrigin(),
                trip.getDestination(),
                trip.getAppPlatform(),
                trip.getStartAt(),
                trip.getEndAt(),
                trip.getDistanceKm(),
                trip.getEstimatedAmount(),
                trip.getActualAmount(),
                trip.getNotes(),
                trip.getCreatedAt()
        );
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TripResponse create(@Valid @RequestBody TripRequest request) {
        Trip trip = new Trip();
        Customer customer = null;
        if (request.customerId() != null) {
            customer = customerRepository.findById(request.customerId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid customerId"));
        }
        trip.setCustomer(customer);
        trip.setTripType(request.tripType());
        trip.setStatus(request.status());
        trip.setOrigin(request.origin());
        trip.setDestination(request.destination());
        trip.setAppPlatform(request.appPlatform());
        trip.setStartAt(request.startAt());
        trip.setEndAt(request.endAt());
        trip.setDistanceKm(request.distanceKm());
        trip.setEstimatedAmount(request.estimatedAmount());
        trip.setActualAmount(request.actualAmount());
        trip.setNotes(request.notes());
        trip.setCreatedAt(OffsetDateTime.now());

        Trip saved = tripRepository.save(trip);
        Long customerId = saved.getCustomer() != null ? saved.getCustomer().getId() : null;
        String customerName = saved.getCustomer() != null ? saved.getCustomer().getName() : null;
        return new TripResponse(
                saved.getId(),
                customerId,
                customerName,
                saved.getTripType(),
                saved.getStatus(),
                saved.getOrigin(),
                saved.getDestination(),
                saved.getAppPlatform(),
                saved.getStartAt(),
                saved.getEndAt(),
                saved.getDistanceKm(),
                saved.getEstimatedAmount(),
                saved.getActualAmount(),
                saved.getNotes(),
                saved.getCreatedAt()
        );
    }

    @PutMapping("/{id}")
    public TripResponse update(@PathVariable Long id, @Valid @RequestBody TripRequest request) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found"));

        Customer customer = null;
        if (request.customerId() != null) {
            customer = customerRepository.findById(request.customerId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid customerId"));
        }
        trip.setCustomer(customer);
        trip.setTripType(request.tripType());
        trip.setStatus(request.status());
        trip.setOrigin(request.origin());
        trip.setDestination(request.destination());
        trip.setAppPlatform(request.appPlatform());
        trip.setStartAt(request.startAt());
        trip.setEndAt(request.endAt());
        trip.setDistanceKm(request.distanceKm());
        trip.setEstimatedAmount(request.estimatedAmount());
        trip.setActualAmount(request.actualAmount());
        trip.setNotes(request.notes());

        Trip saved = tripRepository.save(trip);
        Long customerId = saved.getCustomer() != null ? saved.getCustomer().getId() : null;
        String customerName = saved.getCustomer() != null ? saved.getCustomer().getName() : null;
        return new TripResponse(
                saved.getId(),
                customerId,
                customerName,
                saved.getTripType(),
                saved.getStatus(),
                saved.getOrigin(),
                saved.getDestination(),
                saved.getAppPlatform(),
                saved.getStartAt(),
                saved.getEndAt(),
                saved.getDistanceKm(),
                saved.getEstimatedAmount(),
                saved.getActualAmount(),
                saved.getNotes(),
                saved.getCreatedAt()
        );
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!tripRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found");
        }
        tripRepository.deleteById(id);
    }
}
