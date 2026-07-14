package com.grainconnect.backend.repository;

import com.grainconnect.backend.entity.Reservation;
import com.grainconnect.backend.entity.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByBuyerId(Long buyerId);

    /** Reservations belonging to grains posted by the given seller (farmer) */
    List<Reservation> findByGrainIdIn(List<Long> grainIds);

    List<Reservation> findByStatusAndExpiresAtBefore(ReservationStatus status, LocalDateTime time);
}
