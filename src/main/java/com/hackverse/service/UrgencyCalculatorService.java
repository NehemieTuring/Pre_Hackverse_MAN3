package com.hackverse.service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import org.springframework.stereotype.Service;

@Service
public class UrgencyCalculatorService {
    public static int calculateUrgency(LocalDateTime dueDate, LocalDateTime referenceDate) {
        if (dueDate == null) return 1;
        long daysRemaining = ChronoUnit.DAYS.between(referenceDate.toLocalDate(), dueDate.toLocalDate());
        if (daysRemaining <= 1)  return 5;
        if (daysRemaining <= 3)  return 4;
        if (daysRemaining <= 7)  return 3;
        if (daysRemaining <= 14) return 2;
        return 1;
    }
}
