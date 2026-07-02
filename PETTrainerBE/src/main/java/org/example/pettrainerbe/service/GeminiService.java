package org.example.pettrainerbe.service;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;
import org.example.pettrainerbe.model.Exercise;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class GeminiService {

    @Value("${gemini.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = JsonMapper.builder().build();

    public String generateWorkoutAdvice(String gender, double bmi, String goal, String fitnessLevel) {
        if (apiKey == null || apiKey.isBlank() || apiKey.startsWith("AIzaSy_REPLACE")) {
            return null;
        }

        // gemini-2.0-* đã bị gỡ khỏi free tier (quota = 0) → dùng thế hệ 2.5
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";

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

    /**
     * Sinh lộ trình 28 ngày bằng Gemini. Trả về danh sách 28 ngày (JSON snake_case)
     * hoặc null nếu key chưa cấu hình / Gemini lỗi / kết quả không hợp lệ
     * (frontend sẽ fallback về thuật toán local).
     */
    public List<Map<String, Object>> generateRoadmap(String gender, double bmi, String goal,
                                                     String fitnessLevel, List<Exercise> exercises) {
        if (apiKey == null || apiKey.isBlank() || apiKey.startsWith("AIzaSy_REPLACE")) {
            return null;
        }

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

        StringBuilder catalog = new StringBuilder();
        Set<String> validNames = new HashSet<>();
        for (Exercise ex : exercises) {
            if (ex.getName() == null) continue;
            validNames.add(ex.getName().trim().toLowerCase());
            String group = ex.getMuscleGroup() != null ? ex.getMuscleGroup().getName() : "Khác";
            catalog.append("- \"").append(ex.getName()).append("\"")
                   .append(" | nhóm cơ: ").append(group)
                   .append(" | level: ").append(levelLabel(ex.getLevel()))
                   .append(" | bật nhảy: ").append(Boolean.TRUE.equals(ex.getIsJump()) ? "có" : "không")
                   .append("\n");
        }

        String prompt = String.format(
            "Bạn là huấn luyện viên cá nhân. Hãy tạo lộ trình tập luyện 28 ngày cho người dùng:\n" +
            "- Giới tính: %s\n- BMI: %.1f\n- Mục tiêu: %s\n- Trình độ: %s\n\n" +
            "DANH SÁCH BÀI TẬP ĐƯỢC PHÉP DÙNG (chỉ dùng đúng tên trong danh sách này, không tự bịa tên):\n%s\n" +
            "YÊU CẦU:\n" +
            "1. Trả về đúng một mảng JSON gồm CHÍNH XÁC 28 phần tử, ngày 1 đến 28.\n" +
            "2. Mỗi tuần có 3-4 ngày tập (trình độ mới bắt đầu: 3 ngày; có kinh nghiệm: 4 ngày), các ngày còn lại là ngày nghỉ.\n" +
            "3. Ngày tập có 3-5 bài, chọn bài phù hợp trình độ và mục tiêu, chia nhóm cơ hợp lý theo tuần, độ khó tăng dần qua các tuần.\n" +
            "4. Nếu BMI > 25 thì KHÔNG chọn bài có bật nhảy.\n" +
            "5. \"reps\" là chuỗi: số lần (vd \"12\" hoặc \"12-15\") với bài sức mạnh, thời gian (vd \"30s\", \"45s\") với bài Cardio/Core.\n" +
            "6. Mỗi phần tử theo đúng schema (snake_case):\n" +
            "{\"day\": 1, \"is_rest_day\": false, \"plan_title\": \"TÊN LỘ TRÌNH VIẾT HOA\", " +
            "\"quest\": \"Tên buổi tập ngắn gọn\", \"story_desc\": \"1 câu động viên tiếng Việt\", " +
            "\"duration\": 45, \"exercises\": [{\"name\": \"tên đúng trong danh sách\", \"sets\": 3, \"reps\": \"12\", \"rest\": \"60s\"}]}\n" +
            "Ngày nghỉ: is_rest_day=true, exercises=[], duration=0.\n" +
            "\"plan_title\" giống nhau cho cả 28 ngày. Chỉ trả về JSON, không giải thích gì thêm.",
            gender, bmi, goal, fitnessLevel, catalog
        );

        Map<String, Object> requestBody = Map.of(
            "contents", List.of(Map.of(
                "parts", List.of(Map.of("text", prompt))
            )),
            "generationConfig", Map.of("response_mime_type", "application/json")
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-goog-api-key", apiKey);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) return null;

            List<?> candidates = (List<?>) response.getBody().get("candidates");
            if (candidates == null || candidates.isEmpty()) return null;
            Map<?, ?> candidate = (Map<?, ?>) candidates.get(0);
            Map<?, ?> content = (Map<?, ?>) candidate.get("content");
            List<?> parts = (List<?>) content.get("parts");
            if (parts == null || parts.isEmpty()) return null;
            String text = (String) ((Map<?, ?>) parts.get(0)).get("text");
            if (text == null || text.isBlank()) return null;

            List<Map<String, Object>> days = objectMapper.readValue(text, new TypeReference<>() {});
            return validateRoadmap(days, validNames);
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            System.err.println("Gemini roadmap HTTP error " + e.getStatusCode() + ": " + e.getResponseBodyAsString());
        } catch (Exception e) {
            System.err.println("Gemini roadmap error: " + e.getMessage());
        }
        return null;
    }

    /**
     * Kiểm tra kết quả Gemini: đủ 28 ngày, loại bỏ bài tập có tên không khớp DB
     * (tên bài phải khớp tuyệt đối vì camera đếm rep, ảnh và nhiệm vụ Daily đều so theo tên).
     */
    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> validateRoadmap(List<Map<String, Object>> days, Set<String> validNames) {
        if (days == null || days.size() != 28) return null;

        for (Map<String, Object> day : days) {
            boolean isRest = Boolean.TRUE.equals(day.get("is_rest_day"));
            if (isRest) {
                day.put("exercises", List.of());
                continue;
            }
            Object raw = day.get("exercises");
            List<Map<String, Object>> kept = new ArrayList<>();
            if (raw instanceof List<?> list) {
                for (Object item : list) {
                    if (item instanceof Map<?, ?> exMap) {
                        Object name = exMap.get("name");
                        if (name instanceof String s && validNames.contains(s.trim().toLowerCase())) {
                            kept.add((Map<String, Object>) exMap);
                        }
                    }
                }
            }
            if (kept.isEmpty()) return null; // ngày tập mà không còn bài hợp lệ → coi như kết quả hỏng
            day.put("exercises", kept);
        }
        return days;
    }

    private String levelLabel(String level) {
        if (level == null) return "Cơ bản";
        return switch (level.trim()) {
            case "1" -> "Cơ bản";
            case "2" -> "Trung bình";
            case "3" -> "Nâng cao";
            default -> level;
        };
    }
}
