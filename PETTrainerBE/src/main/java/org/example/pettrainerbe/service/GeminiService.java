package org.example.pettrainerbe.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${gemini.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public String generateWorkoutAdvice(String gender, double bmi, String goal, String fitnessLevel) {
        if (apiKey == null || apiKey.isBlank() || apiKey.startsWith("AIzaSy_REPLACE")) {
            return null;
        }

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent";

        String prompt = String.format(
            "Bạn là huấn luyện viên cá nhân. Viết lời khuyên tập luyện ngắn gọn (3-4 câu bằng tiếng Việt) cho người dùng: " +
            "Giới tính: %s, BMI: %.1f, Mục tiêu: %s, Trình độ: %s. " +
            "Chỉ nói về bài tập, không đề cập chế độ ăn.",
            gender, bmi, goal, fitnessLevel
        );

        Map<String, Object> requestBody = Map.of(
            "contents", List.of(Map.of(
                "parts", List.of(Map.of("text", prompt))
            ))
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-goog-api-key", apiKey);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            System.out.println("Gemini status: " + response.getStatusCode());
            System.out.println("Gemini body: " + response.getBody());
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                List<?> candidates = (List<?>) response.getBody().get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<?, ?> candidate = (Map<?, ?>) candidates.get(0);
                    Map<?, ?> content = (Map<?, ?>) candidate.get("content");
                    List<?> parts = (List<?>) content.get("parts");
                    if (parts != null && !parts.isEmpty()) {
                        Map<?, ?> part = (Map<?, ?>) parts.get(0);
                        return (String) part.get("text");
                    }
                }
            }
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            System.err.println("Gemini HTTP error " + e.getStatusCode() + ": " + e.getResponseBodyAsString());
        } catch (Exception e) {
            System.err.println("Gemini API error: " + e.getMessage());
        }
        return null;
    }
}
