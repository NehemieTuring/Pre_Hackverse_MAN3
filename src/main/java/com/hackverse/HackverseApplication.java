package com.hackverse;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class HackverseApplication {
    public static void main(String[] args) {
        SpringApplication.run(HackverseApplication.class, args);
    }
}
