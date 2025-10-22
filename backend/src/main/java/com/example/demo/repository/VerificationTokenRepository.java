package com.example.demo.repository;

import com.example.demo.model.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {
    Optional<VerificationToken> findByToken(String token);

    @Modifying
    @Query(value = "DELETE FROM verification_token WHERE token = :token", nativeQuery = true)
    void deleteByTokenNative(@Param("token") String token);
}
