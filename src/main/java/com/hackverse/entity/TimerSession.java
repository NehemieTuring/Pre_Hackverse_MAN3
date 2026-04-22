package com.hackverse.entity;

import com.hackverse.enums.TimerStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "timer_sessions")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class TimerSession {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Task task;

    @Column(nullable = false)
    private LocalDateTime startTime;

    private LocalDateTime endTime;
    private Long durationSeconds;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TimerStatus status = TimerStatus.ACTIVE;
}
