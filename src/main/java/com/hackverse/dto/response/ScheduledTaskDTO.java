package com.hackverse.dto.response;

import com.hackverse.enums.EisenhowerQuadrant;
import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ScheduledTaskDTO {
    private Long taskId;
    private String title;
    private EisenhowerQuadrant quadrant;
    private Integer priorityScore;
    private LocalDateTime dueDate;
    private LocalDateTime scheduledStart;
    private LocalDateTime scheduledEnd;
    private String status;
    private String reason;
}
