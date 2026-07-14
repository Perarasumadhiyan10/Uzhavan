package com.grainconnect.backend.dto.request;

import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class ProfileUpdateRequest {

    private String name;

    @Pattern(regexp = "\\d{10}", message = "Phone must be exactly 10 digits")
    private String phone;

    /** Buyer only */
    private String address;

    /** Seller only */
    private String farmLocation;
}
