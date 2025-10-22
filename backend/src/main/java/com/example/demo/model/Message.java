package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;


@Entity
@Data
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String sender;

    private String recipient;

    private String content;

    private String timestamp;
}

