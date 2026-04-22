package com.hackverse.service;

import com.hackverse.dto.request.TaskRequest;
import com.hackverse.entity.Task;
import com.hackverse.entity.User;
import com.hackverse.enums.TaskStatus;
import com.hackverse.repository.TaskRepository;
import com.hackverse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final EisenhowerService eisenhowerService;

    public Task createTask(TaskRequest request, Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        Task task = Task.builder()
                .title(request.title())
                .description(request.description())
                .dueDate(request.dueDate())
                .importance(request.importance())
                .estimatedTimeMinutes(request.estimatedTimeMinutes())
                .user(user)
                .build();
        return taskRepository.save(task);
    }

    public List<Task> getUserTasks(Long userId) {
        return taskRepository.findByUserId(userId);
    }

    public List<Task> getTasksSortedByEisenhower(Long userId) {
        List<Task> tasks = taskRepository.findByUserId(userId);
        tasks.sort(Comparator
            .comparing((Task t) -> eisenhowerService.getQuadrantOrder(t.getEisenhowerQuadrant()))
            .thenComparing(Comparator.comparing(Task::getPriorityScore).reversed())
            .thenComparing(Task::getDueDate));
        return tasks;
    }

    public Task updateTask(Long id, TaskRequest request, Long userId) {
        Task task = taskRepository.findById(id).orElseThrow();
        if (!task.getUser().getId().equals(userId)) throw new RuntimeException("Access denied");
        
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setImportance(request.importance());
        task.setDueDate(request.dueDate());
        task.setEstimatedTimeMinutes(request.estimatedTimeMinutes());
        
        return taskRepository.save(task);
    }

    public void deleteTask(Long id, Long userId) {
        Task task = taskRepository.findById(id).orElseThrow();
        if (!task.getUser().getId().equals(userId)) throw new RuntimeException("Access denied");
        taskRepository.delete(task);
    }

    public Task getTaskById(Long id) {
        return taskRepository.findById(id).orElseThrow(() -> new RuntimeException("Task not found"));
    }

    public Task save(Task task) {
        return taskRepository.save(task);
    }
}
