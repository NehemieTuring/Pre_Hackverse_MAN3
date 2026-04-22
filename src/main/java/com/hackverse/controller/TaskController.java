package com.hackverse.controller;

import com.hackverse.dto.request.TaskRequest;
import com.hackverse.entity.Task;
import com.hackverse.entity.TimerSession;
import com.hackverse.repository.UserRepository;
import com.hackverse.service.TaskService;
import com.hackverse.service.TimerSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {
    private final TaskService taskService;
    private final TimerSessionService timerService;
    private final UserRepository userRepository;

    private Long getUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername()).orElseThrow().getId();
    }

    @PostMapping
    public Task createTask(@RequestBody TaskRequest request, @AuthenticationPrincipal UserDetails userDetails) {
        return taskService.createTask(request, getUserId(userDetails));
    }

    @GetMapping
    public List<Task> getTasks(@AuthenticationPrincipal UserDetails userDetails, @RequestParam(required = false) String sort) {
        if ("eisenhower".equals(sort)) return taskService.getTasksSortedByEisenhower(getUserId(userDetails));
        return taskService.getUserTasks(getUserId(userDetails));
    }

    @GetMapping("/{id}")
    public Task getTask(@PathVariable Long id) {
        return taskService.getTaskById(id);
    }

    @PutMapping("/{id}")
    public Task updateTask(@PathVariable Long id, @RequestBody TaskRequest request, @AuthenticationPrincipal UserDetails userDetails) {
        return taskService.updateTask(id, request, getUserId(userDetails));
    }

    @DeleteMapping("/{id}")
    public void deleteTask(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        taskService.deleteTask(id, getUserId(userDetails));
    }

    @PostMapping("/{id}/timer/start")
    public ResponseEntity<TimerSession> startTimer(@PathVariable Long id) {
        return ResponseEntity.ok(timerService.startTimer(id));
    }

    @PostMapping("/{id}/timer/pause")
    public ResponseEntity<TimerSession> pauseTimer(@PathVariable Long id) {
        return ResponseEntity.ok(timerService.pauseTimer(id));
    }

    @PostMapping("/{id}/timer/stop")
    public ResponseEntity<TimerSession> stopTimer(@PathVariable Long id) {
        return ResponseEntity.ok(timerService.stopTimer(id));
    }

    @GetMapping("/{id}/timer")
    public ResponseEntity<TimerSession> getTimer(@PathVariable Long id) {
        return ResponseEntity.ok(timerService.getActiveTimer(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Task> updateStatus(@PathVariable Long id, @RequestParam com.hackverse.enums.TaskStatus status) {
        Task task = taskService.getTaskById(id);
        task.setStatus(status);
        return ResponseEntity.ok(taskService.save(task));
    }

    @PutMapping("/{id}/schedule")
    public ResponseEntity<Task> updateSchedule(@PathVariable Long id, @RequestBody com.hackverse.dto.request.ScheduleRequest request) {
        Task task = taskService.getTaskById(id);
        task.setScheduledStart(request.scheduledStart());
        task.setScheduledEnd(request.scheduledEnd());
        return ResponseEntity.ok(taskService.save(task));
    }
}
