package com.example.demo.controller;

import com.example.demo.model.Message;
import com.example.demo.model.Notification;
import com.example.demo.repository.MessageRepository;
import com.example.demo.repository.NotificationRepository;
import lombok.AllArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
@AllArgsConstructor
public class WebSocketChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageRepository messageRepository;
    private final NotificationRepository notificationRepository;

    @MessageMapping("/chat.send")
    public void sendMessage(Message message, SimpMessageHeaderAccessor headerAccessor) {
        message.setTimestamp(LocalDateTime.now().toString());
        messageRepository.save(message);

        Notification notification = new Notification();
        notification.setSender(message.getSender());
        notification.setRecipient(message.getRecipient());
        notification.setType("NEW_MESSAGE");
        notification.setMessagePreview(message.getContent().substring(0, Math.min(30, message.getContent().length())));
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(notification);

        messagingTemplate.convertAndSendToUser(
                message.getRecipient(),
                "/queue/messages",
                message
        );

        messagingTemplate.convertAndSendToUser(
                message.getRecipient(),
                "/queue/notifications",
                notification
        );
    }

    @GetMapping("/history")
    public List<Message> getChatHistory(
            @RequestParam String sender,
            @RequestParam String recipient
    ) {
        return messageRepository.findBySenderAndRecipientOrSenderAndRecipientOrderByTimestampAsc(
                sender, recipient,
                recipient, sender
        );
    }

    @GetMapping("/contacts")
    public List<String> getChatContacts(@RequestParam String email) {
        return messageRepository.findChatPartners(email);
    }
}
