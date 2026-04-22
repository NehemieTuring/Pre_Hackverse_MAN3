package com.hackverse.controller;

import com.hackverse.entity.Unavailability;
import com.hackverse.repository.UnavailabilityRepository;
import com.hackverse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/unavailabilities")
@RequiredArgsConstructor
public class UnavailabilityController {
    private final UnavailabilityRepository repository;
    private final UserRepository userRepository;

    private Long getUserId(UserDetails details) {
        return userRepository.findByEmail(details.getUsername()).orElseThrow().getId();
    }

    @PostMapping
    public Unavailability create(@RequestBody Unavailability unavailability, @AuthenticationPrincipal UserDetails details) {
        unavailability.setUser(userRepository.findByEmail(details.getUsername()).orElseThrow());
        return repository.save(unavailability);
    }

    @GetMapping
    public List<Unavailability> list(@AuthenticationPrincipal UserDetails details) {
        return repository.findByUserId(getUserId(details));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Unavailability> update(@PathVariable Long id, @RequestBody Unavailability request) {
        Unavailability existing = repository.findById(id)
                .orElseThrow(() -> new com.hackverse.exception.ResourceNotFoundException("Unavailability not found"));
        
        existing.setTitle(request.getTitle());
        existing.setStartTime(request.getStartTime());
        existing.setEndTime(request.getEndTime());
        existing.setRecurrenceRule(request.getRecurrenceRule());
        
        return ResponseEntity.ok(repository.save(existing));
    }
}
