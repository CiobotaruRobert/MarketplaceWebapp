package com.example.demo.controller;

import com.example.demo.dto.UserProfile;
import com.example.demo.model.User;
import com.example.demo.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;


@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService){
        this.userService = userService;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfile> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        Optional<User> user = userService.findByEmail(userDetails.getUsername());
        if (user.isEmpty()) return ResponseEntity.notFound().build();

        UserProfile userProfile = new UserProfile(user.get().getName(), user.get().getPhone(), user.get().getLocation());
        return ResponseEntity.ok(userProfile);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfile> updateProfile(@AuthenticationPrincipal UserDetails userDetails,
                                                 @RequestBody UserProfile updatedUser) {
        Optional<User> user = userService.findByEmail(userDetails.getUsername());
        if (user.isEmpty()) return ResponseEntity.notFound().build();

        user.get().setName(updatedUser.getName());
        user.get().setPhone(updatedUser.getPhone());
        user.get().setLocation(updatedUser.getLocation());

        userService.saveUser(user.get());

        return ResponseEntity.ok(new UserProfile(user.get().getName(), user.get().getPhone(), user.get().getLocation()));
    }



}
