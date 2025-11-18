package com.hrmanagement.model;

/**
 * Lớp đại diện cho dữ liệu phản hồi (response) từ backend gửi về frontend.
 * Backend sẽ trả JSON dạng: { "reply": "Xin chào! Tôi là chatbot Gemini 🤖" }
 */
public class AIResponse {

    private String reply;

    public AIResponse() {}

    public AIResponse(String reply) {
        this.reply = reply;
    }

    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
    }
}
