package com.hackverse.service;

import com.hackverse.dto.response.ScheduledTaskDTO;
import com.hackverse.entity.*;
import com.hackverse.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlannerService {
    private final TaskRepository taskRepository;
    private final UnavailabilityRepository unavailabilityRepository;
    private final EisenhowerService eisenhowerService;

    public List<ScheduledTaskDTO> generatePlanning(Long userId) {
        List<Task> tasks = taskRepository.findByUserIdAndStatusNot(userId, com.hackverse.enums.TaskStatus.DONE);
        tasks.sort(Comparator
            .comparing((Task t) -> eisenhowerService.getQuadrantOrder(t.getEisenhowerQuadrant()))
            .thenComparing(Comparator.comparing(Task::getPriorityScore).reversed())
            .thenComparing(Task::getDueDate));

        LocalDateTime startTime = LocalDateTime.now().plusHours(1).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime maxDueDate = tasks.stream().map(Task::getDueDate).max(LocalDateTime::compareTo).orElse(startTime);
        LocalDateTime endTime = maxDueDate.plusDays(7);

        List<TimeSlot> freeSlots = new ArrayList<>();
        freeSlots.add(new TimeSlot(startTime, endTime));

        List<Unavailability> unavailabilities = unavailabilityRepository.findByUserId(userId);
        for (Unavailability u : unavailabilities) {
            freeSlots = subtractPeriod(freeSlots, u.getStartTime(), u.getEndTime());
        }

        List<ScheduledTaskDTO> result = new ArrayList<>();
        for (Task task : tasks) {
            int needed = task.getEstimatedTimeMinutes();
            boolean scheduled = false;
            for (int i = 0; i < freeSlots.size(); i++) {
                TimeSlot slot = freeSlots.get(i);
                long available = ChronoUnit.MINUTES.between(slot.start, slot.end);
                if (available >= needed && !slot.start.plusMinutes(needed).isAfter(task.getDueDate())) {
                    LocalDateTime sStart = slot.start;
                    LocalDateTime sEnd = slot.start.plusMinutes(needed);
                    result.add(ScheduledTaskDTO.builder()
                            .taskId(task.getId()).title(task.getTitle())
                            .quadrant(task.getEisenhowerQuadrant()).priorityScore(task.getPriorityScore())
                            .dueDate(task.getDueDate()).scheduledStart(sStart).scheduledEnd(sEnd)
                            .status("SCHEDULED").build());
                    slot.start = sEnd;
                    scheduled = true;
                    break;
                }
            }
            if (!scheduled) {
                result.add(ScheduledTaskDTO.builder().taskId(task.getId()).title(task.getTitle())
                        .status("UNSCHEDULABLE").reason("Aucun créneau libre avant la date d'échéance").build());
            }
        }
        return result;
    }

    @Transactional
    public int applyPlanning(Long userId, List<ScheduledTaskDTO> plan) {
        int count = 0;
        if (plan == null) return 0;
        
        for (ScheduledTaskDTO dto : plan) {
            if ("SCHEDULED".equals(dto.getStatus())) {
                Task task = taskRepository.findById(dto.getTaskId()).orElseThrow();
                if (task.getUser().getId().equals(userId)) {
                    task.setScheduledStart(dto.getScheduledStart());
                    task.setScheduledEnd(dto.getScheduledEnd());
                    taskRepository.save(task);
                    count++;
                }
            }
        }
        return count;
    }

    private List<TimeSlot> subtractPeriod(List<TimeSlot> slots, LocalDateTime start, LocalDateTime end) {
        List<TimeSlot> nextSlots = new ArrayList<>();
        for (TimeSlot slot : slots) {
            if (end.isBefore(slot.start) || start.isAfter(slot.end)) {
                nextSlots.add(slot);
            } else {
                if (start.isAfter(slot.start)) nextSlots.add(new TimeSlot(slot.start, start));
                if (end.isBefore(slot.end)) nextSlots.add(new TimeSlot(end, slot.end));
            }
        }
        return nextSlots.stream().filter(s -> ChronoUnit.MINUTES.between(s.start, s.end) >= 15).collect(Collectors.toList());
    }

    private static class TimeSlot {
        LocalDateTime start; LocalDateTime end;
        TimeSlot(LocalDateTime s, LocalDateTime e) { this.start = s; this.end = e; }
    }
}
