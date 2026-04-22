package com.hackverse.service;

import com.hackverse.entity.NotificationLog;
import com.hackverse.entity.Task;
import com.hackverse.enums.NotificationStatus;
import com.hackverse.enums.TaskStatus;
import com.hackverse.repository.NotificationLogRepository;
import com.hackverse.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {
    private final TaskRepository taskRepository;
    private final NotificationLogRepository logRepository;
    private final JavaMailSender mailSender;

    @Scheduled(cron = "0 0 8 * * ?") // 8h du matin
    public void send24hReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime tomorrow = now.plusDays(1);
        
        List<Task> urgentTasks = taskRepository.findAll().stream()
                .filter(t -> t.getStatus() != TaskStatus.DONE)
                .filter(t -> t.getDueDate().isAfter(now) && t.getDueDate().isBefore(tomorrow))
                .filter(t -> t.getUser().isEmailNotificationsEnabled())
                .toList();

        for (Task task : urgentTasks) {
            if (!logRepository.existsByTaskIdAndEmailTypeAndSentAtAfter(task.getId(), "REMINDER_24H", now.minusHours(23))) {
                sendEmail(task);
            }
        }
    }

    private void sendEmail(Task task) {
        try {
            var message = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(message, true);
            helper.setTo(task.getUser().getEmail());
            helper.setSubject("Rappel : " + task.getTitle());
            helper.setText("Bonjour " + task.getUser().getFullName() + ",\n\nVotre tâche '" + task.getTitle() + "' arrive à échéance bientôt.");
            
            mailSender.send(message);
            
            logRepository.save(NotificationLog.builder()
                    .user(task.getUser())
                    .task(task)
                    .status(NotificationStatus.SENT)
                    .build());
        } catch (Exception e) {
            logRepository.save(NotificationLog.builder()
                    .user(task.getUser())
                    .task(task)
                    .status(NotificationStatus.FAILED)
                    .errorMessage(e.getMessage())
                    .build());
        }
    }
}
