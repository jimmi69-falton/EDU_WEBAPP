package com.hrmanagement.service;

import com.hrmanagement.model.User;
import com.hrmanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils; 
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired // <--- 2. TIÊM PasswordEncoder
    private PasswordEncoder passwordEncoder;

    // --- Hàm tiện ích lấy User hiện tại (Giữ nguyên) ---
    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username;
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }
        return userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với email: " + username));
    }

    public User getCurrentUserProfile() {
        return getCurrentUser();
    }
    
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với email: " + email));
    }

    // Cập nhật thông tin user
    @Transactional
    public User updateUser(Long id, User userDetails) {
        User currentUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng để cập nhật"));
        
        // 1. Kiểm tra bảo mật
        if (!getCurrentUser().getId().equals(id)) {
            throw new RuntimeException("Không có quyền cập nhật thông tin người dùng này");
        }
        
        // 2. Cập nhật các trường (chỉ khi có giá trị)
        if (StringUtils.hasText(userDetails.getName())) {
            currentUser.setName(userDetails.getName());
        }
        if (StringUtils.hasText(userDetails.getPhone())) {
            currentUser.setPhone(userDetails.getPhone());
        }
        if (StringUtils.hasText(userDetails.getAddress())) {
            currentUser.setAddress(userDetails.getAddress());
        }

        // Lưu và trả về đối tượng User đã được cập nhật
        return userRepository.save(currentUser);
    }

    // Cập nhật mật khẩu
    @Transactional
    public User updatePassword(Long id, String currentPassword, String newPassword) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng để cập nhật mật khẩu"));

        // 1. Kiểm tra bảo mật
        if (!getCurrentUser().getId().equals(id)) {
            throw new RuntimeException("Không có quyền thay đổi mật khẩu của người dùng khác");
        }

        // 2. Kiểm tra mật khẩu hiện tại
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Mật khẩu hiện tại không chính xác!");
        }
        
        // 3. Mã hóa mật khẩu mới trước khi lưu
        String encodedPassword = passwordEncoder.encode(newPassword);
        user.setPassword(encodedPassword); 

        // 4. Lưu lại user đã được cập nhật mật khẩu
        return userRepository.save(user);
    }
    
    public void deleteUser(Long id) {
        User currentUser = getCurrentUser(); // Lấy người dùng đang đăng nhập

        // 1. Kiểm tra quyền (Giữ nguyên)
        if (!currentUser.getId().equals(id)) {
            throw new RuntimeException("Không có quyền xóa người dùng này");
        }
        
        // 2. TÌM người dùng dựa trên ID nhận được (chắc chắn người dùng đó tồn tại trong DB)
        User userToDelete = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng để xóa"));
            
        // 3. Xóa người dùng đó
        userRepository.delete(userToDelete); // Dùng userToDelete thay vì currentUser (cách này an toàn hơn)
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void deleteUserByAdmin(Long id) {
        User userToDelete = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng để xóa"));
        userRepository.delete(userToDelete);
    }
}