package com.grainconnect.backend.config;

import com.grainconnect.backend.entity.Grain;
import com.grainconnect.backend.entity.Role;
import com.grainconnect.backend.entity.User;
import com.grainconnect.backend.repository.GrainRepository;
import com.grainconnect.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final GrainRepository grainRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return; // already seeded
        }

        User s1 = userRepository.save(User.builder()
                .name("Rajesh Kumar").email("rajesh@example.com").phone("9876543210")
                .password(passwordEncoder.encode("password123"))
                .role(Role.SELLER).farmLocation("Thanjavur, Tamil Nadu").build());

        User s2 = userRepository.save(User.builder()
                .name("Suresh Pillai").email("suresh@example.com").phone("9876543211")
                .password(passwordEncoder.encode("password123"))
                .role(Role.SELLER).farmLocation("Kanchipuram, Tamil Nadu").build());

        User s3 = userRepository.save(User.builder()
                .name("Mani Selvan").email("mani@example.com").phone("9876543212")
                .password(passwordEncoder.encode("password123"))
                .role(Role.SELLER).farmLocation("Coimbatore, Tamil Nadu").build());

        userRepository.save(User.builder()
                .name("Vikram Buyer").email("vikram@example.com").phone("9876543220")
                .password(passwordEncoder.encode("password123"))
                .role(Role.BUYER).address("Chennai, Tamil Nadu").build());

        grainRepository.save(Grain.builder()
                .name("Premium Wheat").type("Wheat").pricePerKg(24).availableKg(500).reservedKg(0)
                .image("https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop")
                .farmer(s1.getName()).farmerId(s1.getId()).farmerPhone(s1.getPhone())
                .location("Thanjavur, Tamil Nadu").lat(10.787).lng(79.138).build());

        grainRepository.save(Grain.builder()
                .name("Basmati Rice").type("Rice").pricePerKg(38).availableKg(300).reservedKg(0)
                .image("https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop")
                .farmer(s2.getName()).farmerId(s2.getId()).farmerPhone(s2.getPhone())
                .location("Kanchipuram, Tamil Nadu").lat(12.833).lng(79.700).build());

        grainRepository.save(Grain.builder()
                .name("Yellow Corn").type("Corn").pricePerKg(19).availableKg(800).reservedKg(0)
                .image("https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=300&fit=crop")
                .farmer(s3.getName()).farmerId(s3.getId()).farmerPhone(s3.getPhone())
                .location("Coimbatore, Tamil Nadu").lat(11.017).lng(76.956).build());

        grainRepository.save(Grain.builder()
                .name("Pearl Millet").type("Millet").pricePerKg(21).availableKg(250).reservedKg(0)
                .image("https://images.unsplash.com/photo-1595855759920-86582396756a?w=400&h=300&fit=crop")
                .farmer(s1.getName()).farmerId(s1.getId()).farmerPhone(s1.getPhone())
                .location("Madurai, Tamil Nadu").lat(9.919).lng(78.120).build());

        grainRepository.save(Grain.builder()
                .name("Organic Barley").type("Barley").pricePerKg(26).availableKg(180).reservedKg(0)
                .image("https://images.unsplash.com/photo-1631209121750-a9f656d28f5d?w=400&h=300&fit=crop")
                .farmer(s2.getName()).farmerId(s2.getId()).farmerPhone(s2.getPhone())
                .location("Salem, Tamil Nadu").lat(11.664).lng(78.146).build());

        grainRepository.save(Grain.builder()
                .name("Red Sorghum").type("Sorghum").pricePerKg(17).availableKg(400).reservedKg(0)
                .image("https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop")
                .farmer(s3.getName()).farmerId(s3.getId()).farmerPhone(s3.getPhone())
                .location("Tirunelveli, Tamil Nadu").lat(8.727).lng(77.684).build());
    }
}
