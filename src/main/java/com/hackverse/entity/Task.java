package com.hackverse.entity;

import com.hackverse.enums.*;
import com.hackverse.service.UrgencyCalculatorService;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Entity
@Table(name = "tasks")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Task {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;
    
    private String description;
    
    @Column(nullable = false)
    private LocalDateTime dueDate;

    @Column(nullable = false)
    private Integer importance;

    private Integer urgency;
    
    @Enumerated(EnumType.STRING)
    private EisenhowerQuadrant eisenhowerQuadrant;
    
    private Integer priorityScore;

    @Column(nullable = false)
    private Integer estimatedTimeMinutes;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TaskStatus status = TaskStatus.TODO;

    private LocalDateTime scheduledStart;
    private LocalDateTime scheduledEnd;
    @Builder.Default
    private Integer actualTimeSpentMinutes = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    @PrePersist
    @PreUpdate
    public void computeEisenhower() {
        this.urgency = UrgencyCalculatorService.calculateUrgency(this.dueDate, LocalDateTime.now());
        
        // Eisenhower logic
        if (this.importance >= 4 && this.urgency >= 4) this.eisenhowerQuadrant = EisenhowerQuadrant.Q1;
        else if (this.importance >= 4 && this.urgency < 4) this.eisenhowerQuadrant = EisenhowerQuadrant.Q2;
        else if (this.importance < 4 && this.urgency >= 4) this.eisenhowerQuadrant = EisenhowerQuadrant.Q3;
        else this.eisenhowerQuadrant = EisenhowerQuadrant.Q4;

        // Composite priority score
        long daysRef = ChronoUnit.DAYS.between(java.time.LocalDate.now(), this.dueDate.toLocalDate());
        int bonus = (daysRef <= 1) ? 5 : (daysRef <= 3) ? 4 : (daysRef <= 7) ? 3 : (daysRef <= 14) ? 2 : 1;
        this.priorityScore = (this.importance * 3) + (this.urgency * 2) + bonus;
    }
}
