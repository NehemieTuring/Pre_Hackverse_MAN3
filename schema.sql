-- Initialisation de la base de données
CREATE DATABASE IF NOT EXISTS hackverse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hackverse;

-- Désactiver les contraintes pour le drop
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS notification_logs;
DROP TABLE IF EXISTS timer_sessions;
DROP TABLE IF EXISTS unavailabilities;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Table users
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email_notifications_enabled BOOLEAN DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email)
) ENGINE=InnoDB;

-- 1b. Table user_roles (nécessaire pour Spring Security)
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    roles VARCHAR(50) NOT NULL,
    CONSTRAINT fk_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 2. Table tasks
CREATE TABLE tasks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NULL,
    importance TINYINT NOT NULL CHECK (importance BETWEEN 1 AND 5),
    urgency TINYINT NOT NULL CHECK (urgency BETWEEN 1 AND 5),
    estimated_time_minutes INT NOT NULL,
    due_date DATETIME NOT NULL,
    status ENUM('TODO', 'IN_PROGRESS', 'DONE') NOT NULL DEFAULT 'TODO',
    eisenhower_quadrant ENUM('Q1', 'Q2', 'Q3', 'Q4') NOT NULL,
    priority_score INT NOT NULL,
    actual_time_spent_minutes INT DEFAULT 0,
    scheduled_start DATETIME NULL,
    scheduled_end DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_tasks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_tasks_user_status (user_id, status),
    INDEX idx_tasks_due_date (due_date),
    INDEX idx_tasks_quadrant (eisenhower_quadrant)
) ENGINE=InnoDB;

-- 3. Table unavailabilities
CREATE TABLE unavailabilities (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    title VARCHAR(100) NOT NULL,
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_rule VARCHAR(255) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_unavail_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_unavail_user_time (user_id, start_datetime)
) ENGINE=InnoDB;

-- 4. Table timer_sessions
CREATE TABLE timer_sessions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    task_id BIGINT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NULL,
    duration_seconds BIGINT NULL,
    status ENUM('ACTIVE', 'PAUSED', 'COMPLETED') NOT NULL DEFAULT 'ACTIVE',
    
    CONSTRAINT fk_timer_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    INDEX idx_timer_task_status (task_id, status)
) ENGINE=InnoDB;

-- 5. Table notification_logs
CREATE TABLE notification_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    task_id BIGINT NULL,
    sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    email_type VARCHAR(50) NOT NULL DEFAULT 'REMINDER_24H',
    status ENUM('SENT', 'FAILED') NOT NULL DEFAULT 'SENT',
    error_message TEXT NULL,
    
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_notif_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
    INDEX idx_notif_user_sent (user_id, sent_at)
) ENGINE=InnoDB;

-- Données de test
INSERT INTO users (full_name, email, password) VALUES 
('Jean Dupont', 'jean.dupont@student.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.7uqqCyO'); -- password: password123

INSERT INTO user_roles (user_id, roles) VALUES (1, 'ROLE_USER');
