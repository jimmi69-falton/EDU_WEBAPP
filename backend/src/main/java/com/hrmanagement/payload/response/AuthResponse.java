package com.hrmanagement.payload.response;

// --- MỚI: Import thêm User và bỏ các annotation không cần thiết ---
import com.fasterxml.jackson.annotation.JsonProperty;
import com.hrmanagement.model.User; // Import model User
import lombok.Data;
// Bỏ @AllArgsConstructor và @NoArgsConstructor để định nghĩa constructor thủ công
// --- HẾT CODE MỚI ---

@Data
// @NoArgsConstructor // --- CŨ ---
// @AllArgsConstructor // --- CŨ ---
public class AuthResponse {
    
    @JsonProperty("token") // --- MỚI: Đổi tên thành "token" cho nhất quán với AuthContext ---
    private String accessToken;
    
    @JsonProperty("tokenType")
    private String tokenType = "Bearer";

    // --- MỚI: Thêm trường User ---
    @JsonProperty("user")
    private User user;
    // --- HẾT CODE MỚI ---

    // --- CŨ ---
    // public AuthResponse(String accessToken) {
    //     this.accessToken = accessToken;
    //     this.tokenType = "Bearer";
    // }
    // --- HẾT CODE CŨ ---

    // --- MỚI: Thêm constructor mà AuthService (Bước 17) cần ---
    public AuthResponse(String accessToken, User user) {
        this.accessToken = accessToken;
        this.user = user;
        this.tokenType = "Bearer";
    }
    // --- HẾT CODE MỚI ---
}