package com.grainconnect.backend.controller;

import com.grainconnect.backend.dto.request.GrainRequest;
import com.grainconnect.backend.dto.response.GrainResponse;
import com.grainconnect.backend.entity.User;
import com.grainconnect.backend.security.CurrentUserProvider;
import com.grainconnect.backend.service.GrainService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/grains")
@RequiredArgsConstructor
public class GrainController {

    private final GrainService grainService;
    private final CurrentUserProvider currentUserProvider;

    /** Public: browse all grain listings, optionally filtered by a search query. */
    @GetMapping
    public ResponseEntity<List<GrainResponse>> getAll(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(grainService.search(search));
    }

    /** Public: view a single grain listing (used by Grain Details page). */
    @GetMapping("/{id}")
    public ResponseEntity<GrainResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(grainService.getById(id));
    }

    /** Seller: get all of the current seller's own listings (Manage Stock page). */
    @GetMapping("/my-listings")
    public ResponseEntity<List<GrainResponse>> getMyListings() {
        User seller = currentUserProvider.getCurrentUser();
        return ResponseEntity.ok(grainService.getMyListings(seller));
    }

    /** Seller: post new grain stock. */
    @PostMapping
    public ResponseEntity<GrainResponse> create(@Valid @RequestBody GrainRequest request) {
        User seller = currentUserProvider.getCurrentUser();
        return ResponseEntity.status(HttpStatus.CREATED).body(grainService.create(request, seller));
    }

    /** Seller: update one of their own grain listings. */
    @PutMapping("/{id}")
    public ResponseEntity<GrainResponse> update(@PathVariable Long id, @Valid @RequestBody GrainRequest request) {
        User seller = currentUserProvider.getCurrentUser();
        return ResponseEntity.ok(grainService.update(id, request, seller));
    }

    /** Seller: delete one of their own grain listings. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        User seller = currentUserProvider.getCurrentUser();
        grainService.delete(id, seller);
        return ResponseEntity.noContent().build();
    }
}
