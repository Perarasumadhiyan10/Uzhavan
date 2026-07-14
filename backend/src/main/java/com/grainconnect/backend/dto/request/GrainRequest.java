package com.grainconnect.backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class GrainRequest {

    @NotBlank(message = "Grain name is required")
    private String name;

    /** Defaults to the grain name if not supplied */
    private String type;

    @NotNull(message = "Price per kg is required")
    @Min(value = 1, message = "Price must be at least 1")
    private Integer pricePerKg;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer availableKg;

    private String image;

    @NotBlank(message = "Farmer phone is required")
    @Pattern(regexp = "\\d{10}", message = "Phone must be exactly 10 digits")
    private String farmerPhone;

    private String location;

    private Double lat;

    private Double lng;
}
