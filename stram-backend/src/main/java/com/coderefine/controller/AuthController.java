package com.coderefine.controller;

import com.coderefine.dto.AuthResponse;
import com.coderefine.dto.LoginRequest;
import com.coderefine.dto.RegisterRequest;
import com.coderefine.dto.UserResponse;
import com.coderefine.model.User;
import com.coderefine.repository.ReviewRepository;
import com.coderefine.repository.UserRepository;
import com.coderefine.service.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepo;
    private final ReviewRepository reviewRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UserRepository userRepo, ReviewRepository reviewRepo,
                          PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepo = userRepo;
        this.reviewRepo = reviewRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        if (userRepo.existsByEmail(req.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already registered");
        }
        if (userRepo.existsByUsername(req.getUsername())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username already taken");
        }

        User user = new User();
        user.setUsername(req.getUsername());
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        userRepo.save(user);

        String token = jwtService.generateToken(user.getId());
        return ResponseEntity.ok(new AuthResponse(token, "bearer", user.getUsername(), user.getEmail()));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        User user = userRepo.findByEmail(req.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        String token = jwtService.generateToken(user.getId());
        return ResponseEntity.ok(new AuthResponse(token, "bearer", user.getUsername(), user.getEmail()));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal User user) {
        long reviewCount = reviewRepo.countByUserId(user.getId());
        return ResponseEntity.ok(new UserResponse(
                user.getId(), user.getUsername(), user.getEmail(),
                user.getCreatedAt(), reviewCount
        ));
    }
}
