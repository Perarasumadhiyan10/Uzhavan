package com.grainconnect.backend.dto.response;

import com.grainconnect.backend.entity.Grain;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GrainResponse {
    private Long id;
    private String name;
    private String type;
    private Integer pricePerKg;
    private Integer availableKg;
    private Integer reservedKg;
    private String image;
    private String farmer;
    private Long farmerId;
    private String farmerPhone;
    private String location;
    private Double lat;
    private Double lng;
    private LocalDateTime postedAt;

    public static GrainResponse fromEntity(Grain g) {
        return GrainResponse.builder()
                .id(g.getId())
                .name(g.getName())
                .type(g.getType())
                .pricePerKg(g.getPricePerKg())
                .availableKg(g.getAvailableKg())
                .reservedKg(g.getReservedKg())
                .image(g.getImage())
                .farmer(g.getFarmer())
                .farmerId(g.getFarmerId())
                .farmerPhone(g.getFarmerPhone())
                .location(g.getLocation())
                .lat(g.getLat())
                .lng(g.getLng())
                .postedAt(g.getPostedAt())
                .build();
    }
}
