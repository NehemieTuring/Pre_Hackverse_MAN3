package com.hackverse.dto.request;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public record TaskRequest(
    @NotBlank String title,
    String description,
    @NotNull @Future LocalDateTime dueDate,
    @Min(1) @Max(5) int importance,
    @Min(15) int estimatedTimeMinutes
) {}
