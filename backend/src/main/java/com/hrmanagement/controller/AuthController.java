package com.hrmanagement.controller;

import com.hrmanagement.payload.request.LoginRequest;
import com.hrmanagement.payload.request.RegisterRequest;
import com.hrmanagement.payload.response.AuthResponse;
import com.hrmanagement.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// --- MỚI: Đã sửa từ javax.validation sang jakarta.validation ---
import jakarta.validation.Valid; 
// --- HẾT CODE MỚI ---

@RestController
@RequestMapping("/api/auth") 
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) { 
        AuthResponse authResponse = authService.loginUser(loginRequest);
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) { 
        AuthResponse authResponse = authService.registerUser(registerRequest);
        return ResponseEntity.ok(authResponse);
    }
}