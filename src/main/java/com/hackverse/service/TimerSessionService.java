package com.hackverse.service;

import com.hackverse.entity.Task;
import com.hackverse.entity.TimerSession;
import com.hackverse.enums.TimerStatus;
import com.hackverse.repository.TaskRepository;
import com.hackverse.repository.TimerSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.Duration;
import java.util.Arrays;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TimerSessionService {
    private final TimerSessionRepository repository;
    private final TaskRepository taskRepository;

    @Transactional
    public TimerSession startTimer(Long taskId) {
        Task task = taskRepository.findById(taskId).orElseThrow();
        Optional<TimerSession> existing = repository.findByTask_IdAndStatus(taskId, TimerStatus.ACTIVE);
        if (existing.isPresent()) return existing.get();

        TimerSession session = TimerSession.builder()
                .task(task)
                .startTime(LocalDateTime.now())
                .status(TimerStatus.ACTIVE)
                .build();
        return repository.save(session);
    }

    @Transactional
    public TimerSession pauseTimer(Long taskId) {
        TimerSession session = repository.findByTask_IdAndStatus(taskId, TimerStatus.ACTIVE)
                .orElseThrow(() -> new IllegalStateException("No active timer"));

        long duration = Duration.between(session.getStartTime(), LocalDateTime.now()).getSeconds();
        session.setDurationSeconds((session.getDurationSeconds() != null ? session.getDurationSeconds() : 0) + duration);
        session.setStatus(TimerStatus.PAUSED);
        return repository.save(session);
    }

    @Transactional
    public TimerSession stopTimer(Long taskId) {
        TimerSession session = repository.findByTask_IdAndStatusIn(taskId, Arrays.asList(TimerStatus.ACTIVE, TimerStatus.PAUSED))
                .orElseThrow(() -> new IllegalStateException("No active or paused timer"));

        if (session.getStatus() == TimerStatus.ACTIVE) {
            long duration = Duration.between(session.getStartTime(), LocalDateTime.now()).getSeconds();
            session.setDurationSeconds((session.getDurationSeconds() != null ? session.getDurationSeconds() : 0) + duration);
        }

        session.setEndTime(LocalDateTime.now());
        session.setStatus(TimerStatus.COMPLETED);
        
        // Update task actual time
        Task task = session.getTask();
        task.setActualTimeSpentMinutes((task.getActualTimeSpentMinutes() != null ? task.getActualTimeSpentMinutes() : 0) 
                + (int)(session.getDurationSeconds() / 60));
        taskRepository.save(task);

        return repository.save(session);
    }

    public TimerSession getActiveTimer(Long taskId) {
        return repository.findByTask_IdAndStatus(taskId, TimerStatus.ACTIVE).orElse(null);
    }
}
