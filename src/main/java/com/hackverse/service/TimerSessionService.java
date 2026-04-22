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
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TimerSessionService {
    private final TimerSessionRepository repository;
    private final TaskRepository taskRepository;

    @Transactional
    public TimerSession startTimer(Long taskId) {
        Task task = taskRepository.findById(taskId).orElseThrow();
        List<TimerSession> existing = repository.findByTask_IdAndStatusIn(taskId, 
            Arrays.asList(TimerStatus.ACTIVE, TimerStatus.PAUSED));
        
        if (!existing.isEmpty()) {
            TimerSession session = existing.get(0);
            if (session.getStatus() == TimerStatus.PAUSED) {
                session.setStatus(TimerStatus.ACTIVE);
                session.setStartTime(LocalDateTime.now());
                repository.save(session);
            }
            // Close other rogue sessions if any
            for (int i = 1; i < existing.size(); i++) {
                existing.get(i).setStatus(TimerStatus.COMPLETED);
                existing.get(i).setEndTime(LocalDateTime.now());
                repository.save(existing.get(i));
            }
            return session;
        }

        TimerSession session = TimerSession.builder()
                .task(task)
                .startTime(LocalDateTime.now())
                .status(TimerStatus.ACTIVE)
                .build();
        return repository.save(session);
    }

    @Transactional
    public TimerSession pauseTimer(Long taskId) {
        List<TimerSession> sessions = repository.findByTask_IdAndStatus(taskId, TimerStatus.ACTIVE);
        if (sessions.isEmpty()) throw new IllegalStateException("No active timer");

        TimerSession session = sessions.get(0);
        long duration = Duration.between(session.getStartTime(), LocalDateTime.now()).getSeconds();
        session.setDurationSeconds((session.getDurationSeconds() != null ? session.getDurationSeconds() : 0) + duration);
        session.setStatus(TimerStatus.PAUSED);
        
        // Close others
        for (int i = 1; i < sessions.size(); i++) {
            sessions.get(i).setStatus(TimerStatus.COMPLETED);
            sessions.get(i).setEndTime(LocalDateTime.now());
            repository.save(sessions.get(i));
        }

        return repository.save(session);
    }

    @Transactional
    public TimerSession stopTimer(Long taskId) {
        List<TimerSession> sessions = repository.findByTask_IdAndStatusIn(taskId, 
            Arrays.asList(TimerStatus.ACTIVE, TimerStatus.PAUSED));
        
        if (sessions.isEmpty()) return null; // No active timer to stop, handle gracefully

        TimerSession session = sessions.get(0);
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

        // Close others
        for (int i = 1; i < sessions.size(); i++) {
            sessions.get(i).setStatus(TimerStatus.COMPLETED);
            sessions.get(i).setEndTime(LocalDateTime.now());
            repository.save(sessions.get(i));
        }

        return repository.save(session);
    }

    public TimerSession getActiveTimer(Long taskId) {
        List<TimerSession> results = repository.findByTask_IdAndStatus(taskId, TimerStatus.ACTIVE);
        return results.isEmpty() ? null : results.get(0);
    }
}
