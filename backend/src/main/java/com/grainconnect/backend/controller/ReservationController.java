package com.grainconnect.backend.controller;

import com.grainconnect.backend.dto.request.ReservationRequest;
import com.grainconnect.backend.dto.response.ReservationResponse;
import com.grainconnect.backend.entity.Role;
import com.grainconnect.backend.entity.User;
import com.grainconnect.backend.exception.ApiException;
import com.grainconnect.backend.security.CurrentUserProvider;
import com.grainconnect.backend.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;
    private final CurrentUserProvider currentUserProvider;

    /** Buyer: reserve a quantity of a grain listing. */
    @PostMapping
    public ResponseEntity<ReservationResponse> create(@Valid @RequestBody ReservationRequest request) {
        User buyer = currentUserProvider.getCurrentUser();
        return ResponseEntity.status(HttpStatus.CREATED).body(reservationService.create(request, buyer));
    }

    /**
     * Current user's reservations.
     * - Buyer: reservations they have placed (My Orders page).
     * - Seller: reservations placed against their grain listings.
     */
    @GetMapping("/my")
    public ResponseEntity<List<ReservationResponse>> getMine() {
        User user = currentUserProvider.getCurrentUser();
        if (user.getRole() == Role.SELLER) {
            return ResponseEntity.ok(reservationService.getOrdersForSeller(user));
        } else if (user.getRole() == Role.BUYER) {
            return ResponseEntity.ok(reservationService.getMyOrders(user));
        }
        throw new ApiException("Unknown user role", HttpStatus.FORBIDDEN);
    }

    /** Buyer: cancel one of their own booked reservations. */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<ReservationResponse> cancel(@PathVariable Long id) {
        User buyer = currentUserProvider.getCurrentUser();
        return ResponseEntity.ok(reservationService.cancel(id, buyer));
    }

    /** Seller: mark a reservation against their stock as collected by the buyer. */
    @PostMapping("/{id}/collect")
    public ResponseEntity<ReservationResponse> markCollected(@PathVariable Long id) {
        User seller = currentUserProvider.getCurrentUser();
        return ResponseEntity.ok(reservationService.markCollected(id, seller));
    }
}
