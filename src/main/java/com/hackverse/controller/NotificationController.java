package com.hackverse.controller;

import com.hackverse.entity.NotificationLog;
import com.hackverse.entity.User;
import com.hackverse.repository.NotificationLogRepository;
import com.hackverse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {
    private final NotificationLogRepository logRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Page<NotificationLog>> getMyNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Page<NotificationLog> logs = logRepository.findByUserId(
                user.getId(), 
                PageRequest.of(page, size, Sort.by("sentAt").descending())
        );
        
        return ResponseEntity.ok(logs);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id) {
        logRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
