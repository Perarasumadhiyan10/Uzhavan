package com.grainconnect.backend.service;

import com.grainconnect.backend.dto.request.GrainRequest;
import com.grainconnect.backend.dto.response.GrainResponse;
import com.grainconnect.backend.entity.Grain;
import com.grainconnect.backend.entity.Role;
import com.grainconnect.backend.entity.User;
import com.grainconnect.backend.exception.ApiException;
import com.grainconnect.backend.repository.GrainRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GrainService {

    private static final String DEFAULT_IMAGE =
            "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop";

    private final GrainRepository grainRepository;

    public List<GrainResponse> getAll() {
        return grainRepository.findAll().stream()
                .map(GrainResponse::fromEntity)
                .toList();
    }

    public List<GrainResponse> search(String query) {
        if (query == null || query.isBlank()) {
            return getAll();
        }
        return grainRepository
                .findByNameContainingIgnoreCaseOrTypeContainingIgnoreCaseOrFarmerContainingIgnoreCase(query, query, query)
                .stream()
                .map(GrainResponse::fromEntity)
                .toList();
    }

    public GrainResponse getById(Long id) {
        return GrainResponse.fromEntity(findOrThrow(id));
    }

    public List<GrainResponse> getMyListings(User seller) {
        return grainRepository.findByFarmerId(seller.getId()).stream()
                .map(GrainResponse::fromEntity)
                .toList();
    }

    public GrainResponse create(GrainRequest request, User seller) {
        requireSeller(seller);

        Grain grain = Grain.builder()
                .name(request.getName().trim())
                .type((request.getType() == null || request.getType().isBlank())
                        ? request.getName().trim() : request.getType().trim())
                .pricePerKg(request.getPricePerKg())
                .availableKg(request.getAvailableKg())
                .reservedKg(0)
                .image((request.getImage() == null || request.getImage().isBlank())
                        ? DEFAULT_IMAGE : request.getImage())
                .farmer(seller.getName())
                .farmerId(seller.getId())
                .farmerPhone(request.getFarmerPhone())
                .location((request.getLocation() == null || request.getLocation().isBlank())
                        ? seller.getFarmLocation() : request.getLocation())
                .lat(request.getLat())
                .lng(request.getLng())
                .build();

        return GrainResponse.fromEntity(grainRepository.save(grain));
    }

    public GrainResponse update(Long id, GrainRequest request, User seller) {
        requireSeller(seller);
        Grain grain = findOrThrow(id);
        ensureOwner(grain, seller);

        grain.setName(request.getName().trim());
        grain.setType((request.getType() == null || request.getType().isBlank())
                ? request.getName().trim() : request.getType().trim());
        grain.setPricePerKg(request.getPricePerKg());
        grain.setAvailableKg(request.getAvailableKg());
        if (request.getImage() != null && !request.getImage().isBlank()) {
            grain.setImage(request.getImage());
        }
        grain.setFarmerPhone(request.getFarmerPhone());
        if (request.getLocation() != null && !request.getLocation().isBlank()) {
            grain.setLocation(request.getLocation());
        }
        if (request.getLat() != null) grain.setLat(request.getLat());
        if (request.getLng() != null) grain.setLng(request.getLng());

        return GrainResponse.fromEntity(grainRepository.save(grain));
    }

    public void delete(Long id, User seller) {
        requireSeller(seller);
        Grain grain = findOrThrow(id);
        ensureOwner(grain, seller);
        grainRepository.delete(grain);
    }

    Grain findOrThrow(Long id) {
        return grainRepository.findById(id)
                .orElseThrow(() -> new ApiException("Grain listing not found", HttpStatus.NOT_FOUND));
    }

    private void ensureOwner(Grain grain, User seller) {
        if (!grain.getFarmerId().equals(seller.getId())) {
            throw new ApiException("You do not have permission to modify this listing", HttpStatus.FORBIDDEN);
        }
    }

    private void requireSeller(User user) {
        if (user.getRole() != Role.SELLER) {
            throw new ApiException("Only sellers can manage grain stock", HttpStatus.FORBIDDEN);
        }
    }
}
