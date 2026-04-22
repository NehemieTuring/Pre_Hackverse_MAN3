package com.hackverse.controller;

import com.hackverse.entity.NotificationLog;
import com.hackverse.repository.NotificationLogRepository;
import com.hackverse.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/notifications")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final NotificationService notificationService;
    private final NotificationLogRepository logRepository;

    @PostMapping("/trigger")
    public ResponseEntity<String> triggerReminders() {
        notificationService.send24hReminders();
        return ResponseEntity.ok("Reminders triggered successfully");
    }

    @GetMapping("/logs")
    public ResponseEntity<Page<NotificationLog>> getLogs(Pageable pageable) {
        return ResponseEntity.ok(logRepository.findAll(pageable));
    }
}
