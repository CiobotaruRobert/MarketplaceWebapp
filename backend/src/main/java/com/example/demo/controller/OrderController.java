package com.example.demo.controller;

import com.example.demo.dto.SellerInfoDTO;
import com.example.demo.model.Ad;
import com.example.demo.model.Order;
import com.example.demo.model.User;
import com.example.demo.repository.AdRepository;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;
import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;

import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final AdRepository adRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final JavaMailSender mailSender;
    private final String stripeSecretKey;

    public OrderController(
            AdRepository adRepository,
            UserRepository userRepository,
            OrderRepository orderRepository,
            JavaMailSender mailSender,
            @Value("${stripe.api.key}") String stripeSecretKey
    ) {
        this.adRepository = adRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.mailSender = mailSender;
        this.stripeSecretKey = stripeSecretKey;
    }

    @PostMapping("/submit-buyer")
    @Transactional
    public ResponseEntity<?> submitBuyerInfo(@RequestBody Map<String, String> payload) {
        Long adId = Long.parseLong(payload.get("adId"));
        Long buyerId = Long.parseLong(payload.get("buyerId"));
        String address = payload.get("buyerAddress");
        String phone = payload.get("buyerPhone");
        String paymentMethod = payload.get("paymentMethod");

        Ad ad = adRepository.findById(adId).orElseThrow();
        User buyer = userRepository.findById(buyerId).orElseThrow();
        User seller = ad.getUser();

        Order order = orderRepository.findByAdAndBuyerAndSeller(ad, buyer, seller)
                .orElse(new Order());

        order.setAd(ad);
        order.setBuyer(buyer);
        order.setSeller(seller);

        order.setBuyerAddress(address);
        order.setBuyerPhone(phone);
        order.setPaymentMethod(Order.PaymentMethod.valueOf(paymentMethod));
        order.setBuyerConfirmed(true);

        orderRepository.save(order);

        if (order.getPaymentMethod() == Order.PaymentMethod.PAY_ON_DELIVERY) {
            String url = "http://localhost:3000/submit-seller-info?orderId=" + order.getId();
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(seller.getEmail());
            message.setSubject("Detalii necesare pentru finalizarea comenzii");
            message.setText("Cineva dorește să cumpere produsul dumneavoastră " + order.getAd().getTitle() +
                    ". Vă rugăm să accesați următorul link și să completați formularul pentru finalizarea comenzii: " + url);
            mailSender.send(message);
        }

        return ResponseEntity.ok(order);
    }

    @PostMapping("/submit-seller")
    @Transactional
    public ResponseEntity<?> submitSellerInfo(@RequestBody SellerInfoDTO payload) throws Exception {

        Order order = orderRepository.findById(payload.orderId).orElseThrow();

        order.setSellerAddress(payload.sellerAddress);
        order.setSellerPhone(payload.sellerPhone);
        order.setSellerConfirmed(true);

        if (order.isBuyerConfirmed() && order.isSellerConfirmed()) {
            order.setOrderPlaced(true);

            if (order.getPaymentMethod() == Order.PaymentMethod.PAY_ONLINE) {

            }
        }

        orderRepository.save(order);

        String buyerUrl = "http://localhost:3000/order-status?orderId=" + order.getId();
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(order.getBuyer().getEmail());
        message.setSubject("Comandă finalizată");
        message.setText("Vânzătorul a acceptat finalizarea comenzii. Produsul va ajunge la dumneavoastră în curând.");
        mailSender.send(message);

        return ResponseEntity.ok(order);
    }

    @PostMapping("/create-payment-session")
    public ResponseEntity<?> createPaymentSession(@RequestBody Map<String, String> payload) throws Exception {
        Long orderId = Long.parseLong(payload.get("orderId"));
        Order order = orderRepository.findById(orderId).orElseThrow();

        Stripe.apiKey = stripeSecretKey;

        SessionCreateParams params =
                SessionCreateParams.builder()
                        .setMode(SessionCreateParams.Mode.PAYMENT)
                        .setSuccessUrl("http://localhost:3000/payment-success?orderId=" + orderId)
                        .setCancelUrl("http://localhost:3000/payment-cancel?orderId=" + orderId)
                        .addLineItem(
                                SessionCreateParams.LineItem.builder()
                                        .setQuantity(1L)
                                        .setPriceData(
                                                SessionCreateParams.LineItem.PriceData.builder()
                                                        .setCurrency("ron")
                                                        .setUnitAmount(order.getAd().getPrice().longValue() * 100)
                                                        .setProductData(
                                                                SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                        .setName(order.getAd().getTitle())
                                                                        .build()
                                                        )
                                                        .build()
                                        )
                                        .build()
                        )
                        .build();

        Session session = Session.create(params);

        return ResponseEntity.ok(Map.of("url", session.getUrl()));
    }

    @PostMapping("/mark-paid")
    @Transactional
    public ResponseEntity<?> markPaid(@RequestBody Map<String, String> payload) {
        Long orderId = Long.parseLong(payload.get("orderId"));
        Order order = orderRepository.findById(orderId).orElseThrow();

        order.setPaid(true);
        orderRepository.save(order);

        if (order.getPaymentMethod() == Order.PaymentMethod.PAY_ONLINE) {
            String url = "http://localhost:3000/submit-seller-info?orderId=" + order.getId();
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(order.getSeller().getEmail());
            message.setSubject("Vă rugăm să confirmați livrarea");
            message.setText("Cumpărătorul a efectuat plata online. Vă rugăm sa transmiteți datele dvs. aici: " + url);
            mailSender.send(message);
        }

        return ResponseEntity.ok("Order marked as paid");
    }

}
