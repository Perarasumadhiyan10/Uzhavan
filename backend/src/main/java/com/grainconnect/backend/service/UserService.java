package com.grainconnect.backend.service;

import com.grainconnect.backend.dto.request.ProfileUpdateRequest;
import com.grainconnect.backend.dto.response.UserResponse;
import com.grainconnect.backend.entity.User;
import com.grainconnect.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserResponse getProfile(User currentUser) {
        return UserResponse.fromEntity(currentUser);
    }

    public UserResponse updateProfile(User currentUser, ProfileUpdateRequest request) {
        if (request.getName() != null && !request.getName().isBlank()) {
            currentUser.setName(request.getName().trim());
        }
        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            currentUser.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            currentUser.setAddress(request.getAddress());
        }
        if (request.getFarmLocation() != null) {
            currentUser.setFarmLocation(request.getFarmLocation());
        }

        User saved = userRepository.save(currentUser);
        return UserResponse.fromEntity(saved);
    }
}
