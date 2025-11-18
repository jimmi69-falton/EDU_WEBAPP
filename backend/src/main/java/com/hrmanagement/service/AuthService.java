package com.hrmanagement.service;

import com.hrmanagement.exception.EmailAlreadyExistsException;
import com.hrmanagement.model.User;
import com.hrmanagement.payload.request.LoginRequest;
import com.hrmanagement.payload.request.RegisterRequest;
import com.hrmanagement.payload.response.AuthResponse;
import com.hrmanagement.repository.UserRepository;
import com.hrmanagement.security.jwt.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    // Logic Đăng nhập
    public AuthResponse loginUser(LoginRequest loginRequest) {
        // 1. Xác thực email và mật khẩu
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        // 2. Lưu trữ thông tin xác thực
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // 3. Lấy User từ DB
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy người dùng sau khi xác thực."));
        
        // 4. Tạo JWT Token
        String jwt = jwtTokenProvider.generateToken(authentication);
        
        // 5. Trả về Response
        return new AuthResponse(jwt, user);
    }

    // Logic Đăng ký (chỉ admin mới được đăng ký)
    public AuthResponse registerUser(RegisterRequest registerRequest) {
        // 1. Kiểm tra Email đã tồn tại chưa
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new EmailAlreadyExistsException("Email đã được sử dụng!");
        }

        // 2. Tạo đối tượng User mới
        User user = new User();
        user.setName(registerRequest.getName());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setRole(registerRequest.getRole());
        user.setPhone(registerRequest.getPhone());
        user.setAddress(registerRequest.getAddress());

        // 3. Lưu User vào DB
        User savedUser = userRepository.save(user);

        // 4. Tự động đăng nhập cho người dùng mới
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        registerRequest.getEmail(),
                        registerRequest.getPassword()
                )
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // 5. Tạo JWT Token
        String jwt = jwtTokenProvider.generateToken(authentication);

        // 6. Trả về Response
        return new AuthResponse(jwt, savedUser);
    }
}