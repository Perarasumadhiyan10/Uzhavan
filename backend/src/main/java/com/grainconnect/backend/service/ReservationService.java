package com.grainconnect.backend.service;

import com.grainconnect.backend.dto.request.ReservationRequest;
import com.grainconnect.backend.dto.response.ReservationResponse;
import com.grainconnect.backend.entity.Grain;
import com.grainconnect.backend.entity.Reservation;
import com.grainconnect.backend.entity.ReservationStatus;
import com.grainconnect.backend.entity.Role;
import com.grainconnect.backend.entity.User;
import com.grainconnect.backend.exception.ApiException;
import com.grainconnect.backend.repository.GrainRepository;
import com.grainconnect.backend.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final GrainRepository grainRepository;

    @Value("${app.reservation.expiry-hours:24}")
    private int expiryHours;

    /** Buyer creates a reservation for a quantity of a grain listing. */
    public ReservationResponse create(ReservationRequest request, User buyer) {
        if (buyer.getRole() != Role.BUYER) {
            throw new ApiException("Only buyers can reserve grain", HttpStatus.FORBIDDEN);
        }

        Grain grain = grainRepository.findById(request.getGrainId())
                .orElseThrow(() -> new ApiException("Grain listing not found", HttpStatus.NOT_FOUND));

        int qty = request.getQuantityKg();
        if (qty <= 0) {
            throw new ApiException("Quantity must be greater than zero", HttpStatus.BAD_REQUEST);
        }
        if (qty > grain.getAvailableKg()) {
            throw new ApiException("Only " + grain.getAvailableKg() + " kg available", HttpStatus.BAD_REQUEST);
        }

        // Move stock from available -> reserved
        grain.setAvailableKg(grain.getAvailableKg() - qty);
        grain.setReservedKg(grain.getReservedKg() + qty);
        grainRepository.save(grain);

        Reservation reservation = Reservation.builder()
                .grainId(grain.getId())
                .grainName(grain.getName())
                .grainImage(grain.getImage())
                .farmer(grain.getFarmer())
                .buyerId(buyer.getId())
                .buyerName(buyer.getName())
                .quantityKg(qty)
                .location(grain.getLocation())
                .lat(grain.getLat())
                .lng(grain.getLng())
                .status(ReservationStatus.Booked)
                .expiresAt(LocalDateTime.now().plusHours(expiryHours))
                .build();

        return ReservationResponse.fromEntity(reservationRepository.save(reservation));
    }

    /** Reservations made by the given buyer. */
    public List<ReservationResponse> getMyOrders(User buyer) {
        expireOverdueReservations();
        return reservationRepository.findByBuyerId(buyer.getId()).stream()
                .map(ReservationResponse::fromEntity)
                .toList();
    }

    /** Reservations placed against grain listings owned by the given seller. */
    public List<ReservationResponse> getOrdersForSeller(User seller) {
        expireOverdueReservations();
        List<Long> grainIds = grainRepository.findByFarmerId(seller.getId()).stream()
                .map(Grain::getId)
                .toList();

        if (grainIds.isEmpty()) {
            return List.of();
        }

        return reservationRepository.findByGrainIdIn(grainIds).stream()
                .map(ReservationResponse::fromEntity)
                .toList();
    }

    /** Buyer cancels their own booked reservation; stock is returned to available. */
    public ReservationResponse cancel(Long reservationId, User buyer) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ApiException("Reservation not found", HttpStatus.NOT_FOUND));

        if (!reservation.getBuyerId().equals(buyer.getId())) {
            throw new ApiException("You do not have permission to cancel this reservation", HttpStatus.FORBIDDEN);
        }
        if (reservation.getStatus() != ReservationStatus.Booked) {
            throw new ApiException("Only booked reservations can be cancelled", HttpStatus.BAD_REQUEST);
        }

        releaseStock(reservation);
        reservation.setStatus(ReservationStatus.Cancelled);
        return ReservationResponse.fromEntity(reservationRepository.save(reservation));
    }

    /** Seller marks a reservation as collected once the buyer picks up the grain. */
    public ReservationResponse markCollected(Long reservationId, User seller) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ApiException("Reservation not found", HttpStatus.NOT_FOUND));

        Grain grain = grainRepository.findById(reservation.getGrainId())
                .orElseThrow(() -> new ApiException("Grain listing not found", HttpStatus.NOT_FOUND));

        if (!grain.getFarmerId().equals(seller.getId())) {
            throw new ApiException("You do not have permission to update this reservation", HttpStatus.FORBIDDEN);
        }
        if (reservation.getStatus() != ReservationStatus.Booked) {
            throw new ApiException("Only booked reservations can be marked as collected", HttpStatus.BAD_REQUEST);
        }

        // Stock leaves the system entirely (reserved -> sold)
        grain.setReservedKg(Math.max(0, grain.getReservedKg() - reservation.getQuantityKg()));
        grainRepository.save(grain);

        reservation.setStatus(ReservationStatus.Collected);
        return ReservationResponse.fromEntity(reservationRepository.save(reservation));
    }

    /** Scans for expired "Booked" reservations, cancels them and returns stock to available. */
    public void expireOverdueReservations() {
        List<Reservation> expired = reservationRepository
                .findByStatusAndExpiresAtBefore(ReservationStatus.Booked, LocalDateTime.now());

        for (Reservation reservation : expired) {
            releaseStock(reservation);
            reservation.setStatus(ReservationStatus.Cancelled);
            reservationRepository.save(reservation);
        }
    }

    private void releaseStock(Reservation reservation) {
        grainRepository.findById(reservation.getGrainId()).ifPresent(grain -> {
            grain.setAvailableKg(grain.getAvailableKg() + reservation.getQuantityKg());
            grain.setReservedKg(Math.max(0, grain.getReservedKg() - reservation.getQuantityKg()));
            grainRepository.save(grain);
        });
    }
}
