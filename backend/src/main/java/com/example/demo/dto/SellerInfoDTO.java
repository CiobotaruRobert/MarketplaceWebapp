package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data
public class SellerInfoDTO {
    public Long orderId;
    public String sellerAddress;
    public String sellerPhone;
}
