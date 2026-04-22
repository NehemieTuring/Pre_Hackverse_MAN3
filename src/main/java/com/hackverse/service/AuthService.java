package com.hackverse.service;

import com.hackverse.dto.request.LoginRequest;
import com.hackverse.dto.request.RegisterRequest;
import com.hackverse.dto.response.AuthResponse;
import com.hackverse.dto.response.UserResponse;
import com.hackverse.entity.User;
import com.hackverse.repository.UserRepository;
import com.hackverse.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final NotificationService notificationService;

    public UserResponse register(RegisterRequest request) {
        User user = User.builder()
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .fullName(request.fullName())
                .roles(Set.of("ROLE_USER"))
                .build();
        user = userRepository.save(user);
        try {
            notificationService.sendWelcomeEmail(user);
        } catch (Exception e) {
            // Logged inside notificationService
        }
        return new UserResponse(user.getId(), user.getEmail(), user.getFullName());
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        User user = userRepository.findByEmail(request.email()).orElseThrow();
        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token, new UserResponse(user.getId(), user.getEmail(), user.getFullName()));
    }
}
