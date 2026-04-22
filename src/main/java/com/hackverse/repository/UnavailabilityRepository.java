package com.hackverse.repository;

import com.hackverse.entity.Unavailability;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UnavailabilityRepository extends JpaRepository<Unavailability, Long> {
    List<Unavailability> findByUserId(Long userId);
}
