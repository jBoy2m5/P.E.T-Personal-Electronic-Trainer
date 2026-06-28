package org.example.pettrainerbe.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.pettrainerbe.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiAiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateRoadmapJson(User user) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;

        String gender = user.getGender() != null ? user.getGender() : "Không xác định";
        String goal = user.getFitnessGoal() != null ? user.getFitnessGoal() : "Cải thiện sức khỏe";
        String level = user.getFitnessLevel() != null ? user.getFitnessLevel() : "Người mới";
        
        String prompt = String.format("Tôi là %s, cao %s cm, nặng %s kg. Mức độ thể lực hiện tại: %s. Mục tiêu của tôi là %s. " +
                "Hãy đóng vai một huấn luyện viên ảo (P.E.T). " +
                "Hãy lập một lộ trình tập luyện 28 ngày phù hợp với tôi. " +
                "Lưu ý: Chỉ trả về mảng JSON thuần túy (không có markdown code block, không có chữ dư thừa), trong đó mỗi phần tử là một object có các trường sau: " +
                "dayNumber (số nguyên từ 1 đến 28), " +
                "muscleGroup (nhóm cơ, VD: 'Ngực & Tay sau', 'Full Body', 'Nghỉ ngơi'), " +
                "challengeName (tên thử thách hấp dẫn, VD: 'Phá vỡ Khiên Cổ Đại', 'Trạm nghỉ chân'), " +
                "duration (thời lượng tập dự kiến tính bằng phút, số nguyên), " +
                "kcal (lượng calo tiêu thụ dự kiến, số nguyên).", 
                gender, user.getHeight(), user.getWeight(), level, goal);

        // Build Request Body
        Map<String, Object> requestBody = new HashMap<>();
        
        Map<String, Object> part = new HashMap<>();
        part.put("text", prompt);
        
        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(part));
        
        requestBody.put("contents", List.of(content));

        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("responseMimeType", "application/json");
        generationConfig.put("maxOutputTokens", 2500);
        
        requestBody.put("generationConfig", generationConfig);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            System.out.println("Sending request to Gemini API...");
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            System.out.println("Gemini Response Status: " + response.getStatusCode());
            System.out.println("Gemini Response Body: " + response.getBody());

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                // Parse the Gemini Response
                JsonNode rootNode = objectMapper.readTree(response.getBody());
                JsonNode candidates = rootNode.path("candidates");
                if (candidates.isArray() && candidates.size() > 0) {
                    JsonNode parts = candidates.get(0).path("content").path("parts");
                    if (parts.isArray() && parts.size() > 0) {
                        return parts.get(0).path("text").asText();
                    } else {
                        System.out.println("Gemini Error: 'parts' is missing or empty.");
                    }
                } else {
                    System.out.println("Gemini Error: 'candidates' is missing or empty.");
                }
            }
        } catch (Exception e) {
            System.err.println("Gemini API Error: " + e.getMessage());
            e.printStackTrace();
        }
        
        return null;
    }
}
