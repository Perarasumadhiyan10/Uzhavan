package com.grainconnect.backend.repository;

import com.grainconnect.backend.entity.Grain;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GrainRepository extends JpaRepository<Grain, Long> {
    List<Grain> findByFarmerId(Long farmerId);

    List<Grain> findByNameContainingIgnoreCaseOrTypeContainingIgnoreCaseOrFarmerContainingIgnoreCase(
            String name, String type, String farmer);
}
