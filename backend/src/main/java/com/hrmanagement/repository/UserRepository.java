package com.hrmanagement.repository;

import com.hrmanagement.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional; // --- MỚI: Import Optional ---

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // --- MỚI: Tìm User bằng Email ---
    // Được AuthService.loginUser() và UserDetailsServiceImpl sử dụng
    Optional<User> findByEmail(String email);

    // --- MỚI: Kiểm tra Email đã tồn tại ---
    // Được AuthService.registerUser() sử dụng
    Boolean existsByEmail(String email);

}