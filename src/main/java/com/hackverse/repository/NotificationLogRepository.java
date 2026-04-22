package com.hackverse.repository;

import com.hackverse.entity.NotificationLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {
    Page<NotificationLog> findByUserId(Long userId, Pageable pageable);
    boolean existsByTaskIdAndEmailTypeAndSentAtAfter(Long taskId, String emailType, java.time.LocalDateTime after);
}
