package com.hackverse.repository;

import com.hackverse.entity.Task;
import com.hackverse.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUserId(Long userId);
    List<Task> findByUserIdAndStatusNot(Long userId, TaskStatus status);
    List<Task> findByStatusNot(TaskStatus status);
}
