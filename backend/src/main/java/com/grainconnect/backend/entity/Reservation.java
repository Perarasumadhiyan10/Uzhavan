package com.grainconnect.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "reservations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long grainId;

    @Column(nullable = false)
    private String grainName;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String grainImage;

    /** Farmer's display name (denormalised for quick display) */
    private String farmer;

    /** Buying user's id */
    @Column(nullable = false)
    private Long buyerId;

    /** Buyer's display name (denormalised for quick display) */
    private String buyerName;

    @Column(nullable = false)
    private Integer quantityKg;

    private String location;

    private Double lat;

    private Double lng;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservationStatus status;

    @Column(updatable = false)
    private LocalDateTime reservedAt;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @PrePersist
    public void onCreate() {
        this.reservedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = ReservationStatus.Booked;
        }
    }
}
