package com.hrmanagement.service;

import com.hrmanagement.model.AIRequest;
import com.hrmanagement.model.AIResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@Service
public class AIService {

    private final WebClient webClient;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    @Autowired
    public AIService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build(); 
    }

    public AIResponse getChatbotResponse(AIRequest aiRequest) {
        
        // 1. CHUYỂN ĐỔI: Map AIRequest đơn giản sang JSON phức tạp của Gemini
        Map<String, Object> geminiRequest = Map.of(
            "contents", List.of(
                Map.of(
                    "parts", List.of(
                        Map.of("text", aiRequest.getMessage())
                    )
                )
            )
        );

        try {
            // 2. Gọi API Gemini
            Mono<Map> responseMono = webClient.post()
                .uri(apiUrl + "?key=" + apiKey) 
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(geminiRequest)
                .retrieve()
                // 3. Xử lý các lỗi 4xx/5xx và log API KEY
                .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(), response -> {
                    response.bodyToMono(String.class).subscribe(body -> {
                        System.err.println("GEMINI API RESPONSE ERROR STATUS: " + response.statusCode());
                        System.err.println("GEMINI API ERROR BODY: " + body); // In ra body lỗi
                    });
                    
                    if (response.statusCode().value() == 400 || response.statusCode().value() == 403) {
                        return Mono.error(new RuntimeException("Lỗi API Gemini: 🔑 Vui lòng kiểm tra API key hoặc cấu trúc request."));
                    }
                    return Mono.error(new RuntimeException("Lỗi máy chủ Gemini: " + response.statusCode()));
                })
                .bodyToMono(Map.class); 

            // 4. Chặn và trả về kết quả
            Map<String, Object> geminiResponse = responseMono.block();
            
            // 5. TRÍCH XUẤT: Lấy câu trả lời từ cấu trúc lồng nhau của Gemini
            if (geminiResponse != null && geminiResponse.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) geminiResponse.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                    String replyText = (String) parts.get(0).get("text");
                    
                    return new AIResponse(replyText);
                }
            }
            
            return new AIResponse("Xin lỗi, tôi không thể trích xuất câu trả lời.");

        } catch (Exception e) {
            System.err.println("Lỗi kết nối /xử lý AI: " + e.getMessage());
            // Trả về lỗi chung cho frontend
            return new AIResponse("⚠️ Xin lỗi, tôi không thể trả lời lúc này. Vui lòng thử lại."); 
        }
    }
}