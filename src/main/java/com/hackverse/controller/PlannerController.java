package com.hackverse.controller;

import com.hackverse.dto.response.ScheduledTaskDTO;
import com.hackverse.repository.UserRepository;
import com.hackverse.service.PlannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/planner")
@RequiredArgsConstructor
public class PlannerController {
    private final PlannerService plannerService;
    private final UserRepository userRepository;

    private Long getUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername()).orElseThrow().getId();
    }

    @PostMapping("/generate")
    public List<ScheduledTaskDTO> generate(@AuthenticationPrincipal UserDetails userDetails) {
        return plannerService.generatePlanning(getUserId(userDetails));
    }

    @PostMapping("/apply")
    public int apply(@AuthenticationPrincipal UserDetails userDetails, @RequestBody List<ScheduledTaskDTO> plan) {
        return plannerService.applyPlanning(getUserId(userDetails), plan);
    }
}
