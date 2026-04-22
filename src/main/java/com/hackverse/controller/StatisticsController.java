package com.hackverse.controller;

import com.hackverse.entity.Task;
import com.hackverse.enums.EisenhowerQuadrant;
import com.hackverse.enums.TaskStatus;
import com.hackverse.repository.TaskRepository;
import com.hackverse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
public class StatisticsController {
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getStats(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = userRepository.findByEmail(userDetails.getUsername()).orElseThrow().getId();
        List<Task> tasks = taskRepository.findByUserId(userId);
        
        Map<String, Object> stats = new HashMap<>();
        long total = tasks.size();
        long done = tasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count();
        
        stats.put("completionRate", total > 0 ? (double) done / total : 0);
        stats.put("totalTasks", total);
        stats.put("completedTasks", done);
        
        Map<EisenhowerQuadrant, Long> quadrantDistribution = tasks.stream()
                .collect(Collectors.groupingBy(Task::getEisenhowerQuadrant, Collectors.counting()));
        stats.put("quadrants", quadrantDistribution);

        return ResponseEntity.ok(stats);
    }
}
