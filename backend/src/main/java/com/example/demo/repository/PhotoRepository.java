package com.example.demo.repository;

import com.example.demo.model.Ad;
import com.example.demo.model.Photo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PhotoRepository extends JpaRepository<Photo, Long> {
    List<Photo> findByAd(Ad ad);
}
