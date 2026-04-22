package com.hackverse.repository;

import com.hackverse.entity.TimerSession;
import com.hackverse.enums.TimerStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TimerSessionRepository extends JpaRepository<TimerSession, Long> {
    Optional<TimerSession> findByTask_IdAndStatusIn(Long taskId, java.util.List<TimerStatus> statuses);
    Optional<TimerSession> findByTask_IdAndStatus(Long taskId, TimerStatus status);
}
