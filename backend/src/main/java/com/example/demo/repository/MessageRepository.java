package com.example.demo.repository;

import com.example.demo.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findBySenderAndRecipientOrSenderAndRecipientOrderByTimestampAsc(
            String sender1, String recipient1, String sender2, String recipient2);

    @Query("SELECT DISTINCT " +
            "CASE WHEN m.sender <> :email THEN m.sender " +
            "     WHEN m.recipient <> :email THEN m.recipient END " +
            "FROM Message m " +
            "WHERE m.sender = :email OR m.recipient = :email")
    List<String> findChatPartners(@Param("email") String email);
}

