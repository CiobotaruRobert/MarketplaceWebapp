package com.example.demo.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class Notification {
    @Id
    @GeneratedValue
    private Long id;
    private String sender;
    private String recipient;
    private String type;
    private String messagePreview;
    private boolean read;
    private LocalDateTime createdAt;
}