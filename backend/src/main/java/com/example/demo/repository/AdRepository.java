package com.example.demo.repository;

import com.example.demo.model.Ad;
import com.example.demo.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AdRepository extends JpaRepository<Ad, Long> {
    List<Ad> findByUserId(Long userId);

    @Query("SELECT a FROM Ad a WHERE " +
            "LOWER(a.title) LIKE LOWER(CONCAT('%', :query, '%')) AND " +
            "(:categoryId IS NULL OR a.category.id = :categoryId) AND " +
            "(:minPrice IS NULL OR a.price >= :minPrice) AND " +
            "(:maxPrice IS NULL OR a.price <= :maxPrice)")
    Page<Ad> searchWithFilters(@Param("query") String query,
                               @Param("categoryId") Long categoryId,
                               @Param("minPrice") Integer minPrice,
                               @Param("maxPrice") Integer maxPrice,
                               Pageable pageable);

    List<Ad> findByUser(User user);
}
