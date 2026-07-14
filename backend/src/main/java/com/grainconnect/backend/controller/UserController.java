package com.grainconnect.backend.controller;

import com.grainconnect.backend.dto.request.ProfileUpdateRequest;
import com.grainconnect.backend.dto.response.UserResponse;
import com.grainconnect.backend.entity.User;
import com.grainconnect.backend.security.CurrentUserProvider;
import com.grainconnect.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final CurrentUserProvider currentUserProvider;

    /** Get the currently logged-in user's profile (buyer or seller). */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getProfile() {
        User currentUser = currentUserProvider.getCurrentUser();
        return ResponseEntity.ok(userService.getProfile(currentUser));
    }

    /** Update the currently logged-in user's profile. */
    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(@Valid @RequestBody ProfileUpdateRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();
        return ResponseEntity.ok(userService.updateProfile(currentUser, request));
    }
}
