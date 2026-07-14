package com.grainconnect.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "grains")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Grain {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    /** Grain category/type, e.g. Wheat, Rice, Corn */
    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private Integer pricePerKg;

    @Column(nullable = false)
    private Integer availableKg;

    @Column(nullable = false)
    private Integer reservedKg;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String image;

    /** Display name of the farmer who posted this stock */
    @Column(nullable = false)
    private String farmer;

    /** Owning seller's user id */
    @Column(nullable = false)
    private Long farmerId;

    private String farmerPhone;

    private String location;

    private Double lat;

    private Double lng;

    @Column(updatable = false)
    private LocalDateTime postedAt;

    @PrePersist
    public void onCreate() {
        this.postedAt = LocalDateTime.now();
        if (this.reservedKg == null) {
            this.reservedKg = 0;
        }
    }
}
