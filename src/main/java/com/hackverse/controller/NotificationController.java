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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user-notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {
    private final NotificationLogRepository logRepository;
    private final UserRepository userRepository;

    @GetMapping("/status")
    public ResponseEntity<String> status() {
        return ResponseEntity.ok("Notification Controller is active at " + java.time.LocalDateTime.now());
    }

    @GetMapping
    public ResponseEntity<?> getMyNotifications(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Page<NotificationLog> logs = logRepository.findByUserId(
                user.getId(), 
                PageRequest.of(page, size, Sort.by("sentAt").descending())
        );

        List<Map<String, Object>> content = logs.getContent().stream().map(log -> {
            try {
                return Map.of(
                    "id", log.getId(),
                    "sentAt", log.getSentAt(),
                    "emailType", log.getEmailType(),
                    "status", log.getStatus(),
                    "task", log.getTask() != null ? Map.of(
                        "id", log.getTask().getId(),
                        "title", log.getTask().getTitle()
                    ) : Map.of()
                );
            } catch (Exception e) {
                return Map.of(
                    "id", log.getId(),
                    "sentAt", log.getSentAt(),
                    "emailType", log.getEmailType(),
                    "status", log.getStatus(),
                    "task", Map.of()
                );
            }
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(Map.of(
            "content", content,
            "totalElements", logs.getTotalElements(),
            "totalPages", logs.getTotalPages()
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id) {
        logRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
