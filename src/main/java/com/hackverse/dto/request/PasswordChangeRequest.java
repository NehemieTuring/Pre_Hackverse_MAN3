package com.hackverse.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PasswordChangeRequest(
    @NotBlank String currentPassword,
    @NotBlank @Size(min = 6) String newPassword
) {}
