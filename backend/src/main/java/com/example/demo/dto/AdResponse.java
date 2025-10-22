package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class AdResponse {
    private Long id;
    private String title;
    private String description;
    private List<String> imageUrls;
    private String categoryName;
}