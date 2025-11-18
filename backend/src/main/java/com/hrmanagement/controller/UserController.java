package com.hrmanagement.controller;

import com.hrmanagement.model.User;
// --- MỚI: Import UserService ---
import com.hrmanagement.service.UserService;
// --- HẾT CODE MỚI ---
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {
    // --- CŨ ---
    // @Autowired
    // private AuthService authService; // Gây ra lỗi
    // --- HẾT CODE CŨ ---

    // --- MỚI: Thay thế bằng UserService ---
    @Autowired
    private UserService userService;

    // 1. THÊM DTO NỘI BỘ: Lớp để nhận mật khẩu mới từ Request Body
    // (Tốt nhất nên đặt lớp này trong thư mục DTO riêng, nhưng tôi đặt ở đây để tiện theo dõi)
    public static class PasswordUpdateRequest {
        private String currentPassword;
        private String newPassword;

        // Getters and Setters
        public String getCurrentPassword() {
            return currentPassword;
        }

        public void setCurrentPassword(String currentPassword) {
            this.currentPassword = currentPassword;
        }
        public String getNewPassword() {
            return newPassword;
        }

        public void setNewPassword(String newPassword) {
            this.newPassword = newPassword;
        }
    }
    // -----------------------------------------------------------
    // --- HẾT CODE MỚI ---

    // --- MỚI: Endpoint để lấy thông tin user đang đăng nhập ---
    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUserProfile() {
        // Hàm này không có trong log lỗi của bạn, nhưng nó rất cần thiết
        // Nó gọi hàm getCurrentUserProfile() chúng ta đã tạo trong UserService
        User currentUser = userService.getCurrentUserProfile();
        return ResponseEntity.ok(currentUser);
    }
    // --- HẾT CODE MỚI ---

    // --- MỚI: Sửa lỗi (Lỗi ở dòng 29 & 45 & 70) ---
    // (Giả định bạn có một endpoint để lấy user bằng email)
    @GetMapping("/email/{email}")
    @PreAuthorize("hasRole('ADMIN')") // Chỉ Admin mới được xem hồ sơ người khác
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        User user = userService.findByEmail(email); // Sửa: gọi userService
        return ResponseEntity.ok(user);
    }
    // --- HẾT CODE MỚI ---

    // --- MỚI: Sửa lỗi (Lỗi ở dòng 54) ---
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        // Chỉ user tự update mình (logic đã có trong service)
        User updatedUser = userService.updateUser(id, userDetails); // Sửa: gọi userService
        return ResponseEntity.ok(updatedUser);
    }
    // --- HẾT CODE MỚI ---

    // 2. PHƯƠNG THỨC MỚI: Endpoint Cập nhật mật khẩu
    @PutMapping("/{id}/password")
    public ResponseEntity<User> updatePassword(@PathVariable Long id, 
                                               @RequestBody PasswordUpdateRequest request) {
        
        // Gọi Service để cập nhật và mã hóa mật khẩu
        User updatedUser = userService.updatePassword(
            id, 
            request.getCurrentPassword(), // <--- TRUYỀN THAM SỐ MỚI
            request.getNewPassword()
        );
        
        // Trả về User đã cập nhật (nên đảm bảo trường password bị ẩn/ignore)
        return ResponseEntity.ok(updatedUser);
    }
    // ------------------------------------------

    // --- MỚI: Sửa lỗi (Lỗi ở dòng 79) ---
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        // Chỉ user tự xóa mình (logic đã có trong service)
        userService.deleteUser(id); // Sửa: gọi userService
        return ResponseEntity.ok("User đã được xóa thành công!");
    }
    // --- HẾT CODE MỚI ---
}