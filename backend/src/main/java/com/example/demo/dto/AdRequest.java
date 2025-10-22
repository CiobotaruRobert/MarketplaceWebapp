package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class AdRequest {
    private String title;
    private String description;
    private Long categoryId;
    private List<String> imageUrls;
}

