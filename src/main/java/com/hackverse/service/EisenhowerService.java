package com.hackverse.service;

import com.hackverse.enums.EisenhowerQuadrant;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
public class EisenhowerService {
    public EisenhowerQuadrant classifyQuadrant(int importance, int urgency) {
        if (importance >= 4 && urgency >= 4) return EisenhowerQuadrant.Q1;
        if (importance >= 4 && urgency < 4) return EisenhowerQuadrant.Q2;
        if (importance < 4 && urgency >= 4) return EisenhowerQuadrant.Q3;
        return EisenhowerQuadrant.Q4;
    }

    public int calculatePriorityScore(int importance, int urgency, LocalDateTime dueDate) {
        long daysRemaining = ChronoUnit.DAYS.between(LocalDate.now(), dueDate.toLocalDate());
        int bonusDelai = (daysRemaining <= 1) ? 5
                       : (daysRemaining <= 3) ? 4
                       : (daysRemaining <= 7) ? 3
                       : (daysRemaining <= 14) ? 2
                       : 1;
        return (importance * 3) + (urgency * 2) + bonusDelai;
    }

    public int getQuadrantOrder(EisenhowerQuadrant q) {
        return switch (q) {
            case Q1 -> 1;
            case Q2 -> 2;
            case Q3 -> 3;
            case Q4 -> 4;
        };
    }
}
