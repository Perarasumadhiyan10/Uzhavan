package com.grainconnect.backend.scheduler;

import com.grainconnect.backend.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ReservationExpiryScheduler {

    private final ReservationService reservationService;

    /** Runs every minute to cancel "Booked" reservations past their expiry time and restock them. */
    @Scheduled(fixedRate = 60_000)
    public void expireOverdueReservations() {
        reservationService.expireOverdueReservations();
    }
}
