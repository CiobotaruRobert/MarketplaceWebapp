package com.example.demo.dto;

import lombok.Data;

@Data
public class ChatRequest {
    private Long senderId;
    private Long recipientId;
    private String content;
}

