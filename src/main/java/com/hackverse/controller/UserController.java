package com.hackverse.controller;

import com.hackverse.entity.User;
import com.hackverse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<User> getMe(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userRepository.findByEmail(userDetails.getUsername()).orElseThrow());
    }

    @PatchMapping("/me/notifications")
    public ResponseEntity<User> toggleNotifications(@AuthenticationPrincipal UserDetails userDetails, @RequestBody com.hackverse.dto.request.NotificationToggleRequest request) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        user.setEmailNotificationsEnabled(request.enabled());
        return ResponseEntity.ok(userRepository.save(user));
    }

    @PutMapping("/me")
    public ResponseEntity<User> updateProfile(@AuthenticationPrincipal UserDetails userDetails, @RequestBody com.hackverse.dto.request.UserUpdateRequest request) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        return ResponseEntity.ok(userRepository.save(user));
    }
}
