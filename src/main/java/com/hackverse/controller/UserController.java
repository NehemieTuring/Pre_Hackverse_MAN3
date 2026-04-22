package com.hackverse.controller;

import com.hackverse.entity.User;
import com.hackverse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.hackverse.dto.request.PasswordChangeRequest;
import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/me/change-password")
    public ResponseEntity<?> changePassword(@AuthenticationPrincipal UserDetails userDetails, @RequestBody PasswordChangeRequest request) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Mot de passe actuel incorrect"));
        }
        
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        return ResponseEntity.ok(java.util.Map.of("message", "Mot de passe mis à jour avec succès"));
    }

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
