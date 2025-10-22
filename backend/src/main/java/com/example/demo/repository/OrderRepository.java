package com.example.demo.repository;

import com.example.demo.model.Ad;
import com.example.demo.model.Order;
import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByAdAndBuyerAndSeller(Ad ad, User buyer, User seller);
}
