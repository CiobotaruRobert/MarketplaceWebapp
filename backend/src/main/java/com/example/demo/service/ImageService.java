package com.example.demo.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


import java.io.IOException;
import java.net.URI;
import java.nio.file.*;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Service
public class ImageService {

    private final Path uploadDir = Paths.get("uploads");

    public ImageService() throws IOException {
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }
    }

    public String saveImage(MultipartFile image) throws IOException {
        String filename = System.currentTimeMillis() + "_" + image.getOriginalFilename();
        Path filePath = uploadDir.resolve(filename);

        Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return "http://localhost:8080/uploads/" + filename;
    }

    public Set<Long> parseIdList(String json) {
        if (json == null || json.isBlank()) return Set.of();
        try {
            ObjectMapper mapper = new ObjectMapper();
            return new HashSet<>(Arrays.asList(mapper.readValue(json, Long[].class)));
        } catch (Exception e) {
            return Set.of();
        }
    }

    public void deleteImage(String imageUrl) {
        try {
            URI uri = new URI(imageUrl);
            String path = uri.getPath();

            if (path.startsWith("/")) {
                path = path.substring(1);
            }

            String baseDir = "uploads";
            Path filePath = Paths.get(baseDir).resolve(path.substring("uploads/".length()));

            Files.deleteIfExists(filePath);
        } catch (Exception e) {
            System.err.println("Failed to delete image: " + e.getMessage());
        }
    }


}
