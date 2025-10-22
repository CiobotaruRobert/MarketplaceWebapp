package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(nullable = false)
    private User buyer;

    @ManyToOne
    @JoinColumn(nullable = false)
    private User seller;

    @ManyToOne
    @JoinColumn(nullable = false)
    private Ad ad;

    private String buyerAddress;
    private String buyerPhone;
    private String sellerAddress;
    private String sellerPhone;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;


    private Boolean paid = false;

    private boolean buyerConfirmed;
    private boolean sellerConfirmed;
    private boolean orderPlaced;

    private LocalDateTime createdAt = LocalDateTime.now();

    public enum PaymentMethod {
        PAY_ON_DELIVERY, PAY_ONLINE
    }
}
