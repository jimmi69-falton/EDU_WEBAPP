package com.hrmanagement.controller;

import com.hrmanagement.model.AIRequest;
import com.hrmanagement.model.AIResponse;
import com.hrmanagement.service.AIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; 
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    @Autowired
    private AIService aiService;

    /**
     * FIX: Map POST method to /chat, giải quyết lỗi NoResourceFoundException (404)
     */
    @PostMapping("/chat") 
    @PreAuthorize("isAuthenticated()") 
    public ResponseEntity<AIResponse> getAIResponse(@RequestBody AIRequest aiRequest) {
        AIResponse response = aiService.getChatbotResponse(aiRequest);
        return ResponseEntity.ok(response);
    }
}