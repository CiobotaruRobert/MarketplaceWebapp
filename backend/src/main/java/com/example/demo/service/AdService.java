package com.example.demo.service;

import com.example.demo.model.Ad;
import com.example.demo.model.Photo;
import com.example.demo.model.User;
import com.example.demo.repository.AdRepository;
import com.example.demo.repository.PhotoRepository;
import com.example.demo.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@AllArgsConstructor
@Service
public class AdService {
    private final AdRepository adRepository;
    private final UserRepository userRepository;
    private final PhotoRepository photoRepository;
    private final ImageService imageService;

    public Ad createAd(Long userId, Ad ad) {
        User user = userRepository.findById(userId).orElseThrow();
        ad.setUser(user);
        return adRepository.save(ad);
    }

    public List<Ad> getAllAds() {
        return adRepository.findAll();
    }

    public Optional<Ad> getAdById(Long id) {
        return adRepository.findById(id);
    }

    public void savePhoto(Photo photo) {
        photoRepository.save(photo);
    }

    public Page<Ad> searchAds(String q, Long categoryId, Integer minPrice, Integer maxPrice, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Ad> result = adRepository.searchWithFilters(q, categoryId, minPrice, maxPrice, pageable);
        return result;
    }



    public List<Ad> getAdsByUser(User user) {
        return adRepository.findByUser(user);
    }

    public Ad saveAd(Ad ad) {
        return adRepository.save(ad);
    }

    @Transactional
    public void deleteAd(Long id) {
        Optional<Ad> adOpt = adRepository.findById(id);
        adOpt.ifPresent(ad -> {
            List<User> favoritedBy = userRepository.findAllByFavoriteAdsContains(ad);
            for (User user : favoritedBy) {
                user.getFavoriteAds().remove(ad);
                userRepository.save(user);
            }

            List<Photo> photos = photoRepository.findByAd(ad);
            for (Photo photo : photos) {
                imageService.deleteImage(photo.getImageUrl());
                photoRepository.delete(photo);
            }

            adRepository.delete(ad);
        });
    }

}
