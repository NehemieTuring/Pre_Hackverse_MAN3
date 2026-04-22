package com.hackverse.dto.request;

import java.time.LocalDateTime;

public record ScheduleRequest(
    LocalDateTime scheduledStart,
    LocalDateTime scheduledEnd
) {}
