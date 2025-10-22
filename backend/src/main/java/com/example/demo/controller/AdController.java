package com.example.demo.controller;

import com.example.demo.model.Ad;
import com.example.demo.model.Category;
import com.example.demo.model.Photo;
import com.example.demo.model.User;
import com.example.demo.security.JwtUtil;
import com.example.demo.service.AdService;
import com.example.demo.service.CategoryService;
import com.example.demo.service.ImageService;
import com.example.demo.service.UserService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@AllArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/ads")
public class AdController {
    private final AdService adService;
    private final CategoryService categoryService;
    private final ImageService imageService;
    private final UserService userService;
    private final JwtUtil jwtUtil;

    private String extractEmailFromAuthHeader(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }

        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) {
            return null;
        }

        return jwtUtil.getEmailFromToken(token);
    }


    @GetMapping
    public List<Ad> getAds() {
        return adService.getAllAds();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAdById(@PathVariable Long id) {
        Optional<Ad> ad = adService.getAdById(id);
        if (ad.isPresent()) {
            return ResponseEntity.ok(ad.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }


    @PostMapping(value = "/post", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createAd(
            @RequestParam("userId") Long userId,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("price") Double price,
            @RequestParam("location") String location,
            @RequestParam("category") Long categoryId,
            @RequestParam(value = "images", required = false) MultipartFile[] images,
            @RequestHeader("Authorization") String authHeader
    ) throws IOException {

        Ad ad = new Ad();
        ad.setTitle(title);
        ad.setDescription(description);
        ad.setPrice(price);
        ad.setLocation(location);

        Category category = categoryService.findById(categoryId);
        ad.setCategory(category);

        Ad savedAd = adService.createAd(userId, ad);

        if (images != null) {
            for (MultipartFile image : images) {
                if (!image.isEmpty()) {
                    String imageUrl = imageService.saveImage(image);

                    Photo photo = new Photo();
                    photo.setImageUrl(imageUrl);
                    photo.setAd(savedAd);

                    adService.savePhoto(photo);
                }
            }
        }

        Optional<Ad> adWithPhotos = adService.getAdById(savedAd.getId());

        return ResponseEntity.ok(adWithPhotos);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateAd(
            @PathVariable Long id,
            @RequestParam("userId") Long userId,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("price") Double price,
            @RequestParam("location") String location,
            @RequestParam("category") Long categoryId,
            @RequestParam(value = "images", required = false) MultipartFile[] newImages,
            @RequestParam(value = "existingImageIds", required = false) String existingImageIdsJson,
            @RequestHeader("Authorization") String authHeader
    ) throws IOException {

        Optional<Ad> adOpt = adService.getAdById(id);
        if (adOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Ad ad = adOpt.get();

        ad.setTitle(title);
        ad.setDescription(description);
        ad.setPrice(price);
        ad.setLocation(location);

        Category category = categoryService.findById(categoryId);
        ad.setCategory(category);

        Set<Long> keptIds = imageService.parseIdList(existingImageIdsJson);
        ad.getPhotos().removeIf(photo -> !keptIds.contains(photo.getId()));
        adService.saveAd(ad);

        if (newImages != null) {
            for (MultipartFile image : newImages) {
                if (!image.isEmpty()) {
                    String imageUrl = imageService.saveImage(image);

                    Photo photo = new Photo();
                    photo.setImageUrl(imageUrl);
                    photo.setAd(ad);

                    adService.savePhoto(photo);
                }
            }
        }

        return ResponseEntity.ok(adService.getAdById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAd(@PathVariable Long id, @RequestHeader("Authorization") String authHeader) {
        String email = extractEmailFromAuthHeader(authHeader);
        if (email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<Ad> adOpt = adService.getAdById(id);
        if (adOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Ad ad = adOpt.get();
        if (!ad.getUser().getEmail().equals(email)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not authorized to delete this ad.");
        }

        adService.deleteAd(id);
        return ResponseEntity.ok().build();
    }


    @GetMapping("/favorites")
    public ResponseEntity<?> getFavoritedAds(@RequestHeader("Authorization") String authHeader) {
        String email = extractEmailFromAuthHeader(authHeader);
        if (email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<User> userOpt = userService.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<Ad> favorites = userOpt.get().getFavoriteAds();
        return ResponseEntity.ok(favorites);
    }


    @PostMapping("/{adId}/favorite")
    public ResponseEntity<?> favoriteAd(@PathVariable Long adId,
                                        @RequestHeader("Authorization") String authHeader) {
        String email = extractEmailFromAuthHeader(authHeader);
        if (email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<User> userOpt = userService.findByEmail(email);
        Optional<Ad> adOpt = adService.getAdById(adId);

        if (userOpt.isEmpty() || adOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        if (!user.getFavoriteAds().contains(adOpt.get())) {
            user.getFavoriteAds().add(adOpt.get());
        }
        userService.saveUser(user);

        return ResponseEntity.ok().build();
    }


    @DeleteMapping("/{adId}/favorite")
    public ResponseEntity<?> unfavoriteAd(@PathVariable Long adId,
                                          @RequestHeader("Authorization") String authHeader) {
        String email = extractEmailFromAuthHeader(authHeader);
        if (email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<User> userOpt = userService.findByEmail(email);
        Optional<Ad> adOpt = adService.getAdById(adId);

        if (userOpt.isEmpty() || adOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        user.getFavoriteAds().removeIf(ad -> ad.getId().equals(adId));
        userService.saveUser(user);

        return ResponseEntity.ok().build();
    }


    @GetMapping("/favorites/ids")
    public ResponseEntity<List<Long>> getFavoriteAdIds(@RequestHeader("Authorization") String authHeader) {
        String email = extractEmailFromAuthHeader(authHeader);
        if (email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<User> userOpt = userService.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<Long> adIds = userOpt.get().getFavoriteAds().stream()
                .map(Ad::getId)
                .collect(Collectors.toList());

        return ResponseEntity.ok(adIds);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<Ad>> searchAds(
            @RequestParam("q") String q,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "minPrice", required = false) Integer minPrice,
            @RequestParam(value = "maxPrice", required = false) Integer maxPrice,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "8") int size
    ) {
        Page<Ad> results = adService.searchAds(q, categoryId, minPrice, maxPrice, page, size);
        return ResponseEntity.ok(results);
    }


    @GetMapping("/my-ads")
    public ResponseEntity<?> getMyAds(@RequestHeader("Authorization") String authHeader) {
        String email = extractEmailFromAuthHeader(authHeader);
        if (email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<User> userOpt = userService.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userOpt.get();
        List<Ad> myAds = adService.getAdsByUser(user);

        return ResponseEntity.ok(myAds);
    }




}
