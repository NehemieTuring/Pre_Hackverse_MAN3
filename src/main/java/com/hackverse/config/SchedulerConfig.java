package com.hackverse.config;

import com.hackverse.entity.Task;
import com.hackverse.enums.TaskStatus;
import com.hackverse.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import java.util.List;

@Configuration
@EnableScheduling
@RequiredArgsConstructor
@Slf4j
public class SchedulerConfig {
    private final TaskRepository taskRepository;

    @Scheduled(cron = "0 0 * * * ?")
    public void recalculateUrgencies() {
        log.info("Recalcul automatique de l'urgence et Eisenhower");
        List<Task> tasks = taskRepository.findByStatusNot(TaskStatus.DONE);
        taskRepository.saveAll(tasks);
        log.info("{} tâches mises à jour", tasks.size());
    }

    @Scheduled(cron = "0 0 8 * * ?")
    public void sendReminderEmails() {
        log.info("Envoi des emails de rappel (stub)");
    }
}
