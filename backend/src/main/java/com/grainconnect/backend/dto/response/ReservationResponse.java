package com.grainconnect.backend.dto.response;

import com.grainconnect.backend.entity.Reservation;
import com.grainconnect.backend.entity.ReservationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationResponse {
    private Long id;
    private Long grainId;
    private String grainName;
    private String grainImage;
    private String farmer;
    private Long buyerId;
    private String buyerName;
    private Integer quantityKg;
    private String location;
    private Double lat;
    private Double lng;
    private ReservationStatus status;
    private LocalDateTime reservedAt;
    private LocalDateTime expiresAt;

    public static ReservationResponse fromEntity(Reservation r) {
        return ReservationResponse.builder()
                .id(r.getId())
                .grainId(r.getGrainId())
                .grainName(r.getGrainName())
                .grainImage(r.getGrainImage())
                .farmer(r.getFarmer())
                .buyerId(r.getBuyerId())
                .buyerName(r.getBuyerName())
                .quantityKg(r.getQuantityKg())
                .location(r.getLocation())
                .lat(r.getLat())
                .lng(r.getLng())
                .status(r.getStatus())
                .reservedAt(r.getReservedAt())
                .expiresAt(r.getExpiresAt())
                .build();
    }
}
