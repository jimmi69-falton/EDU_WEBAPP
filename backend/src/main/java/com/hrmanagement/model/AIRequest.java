package com.hrmanagement.model;

/**
 * Lớp đại diện cho dữ liệu yêu cầu (request) gửi từ frontend lên backend.
 * Frontend sẽ gửi JSON có dạng: { "message": "Xin chào AI Bot!" }
 */
public class AIRequest {

    private String message;

    public AIRequest() {}

    public AIRequest(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
