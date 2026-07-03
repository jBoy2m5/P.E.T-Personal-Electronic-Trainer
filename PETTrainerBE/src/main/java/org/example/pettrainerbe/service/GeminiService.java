package org.example.pettrainerbe.service;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;
import org.example.pettrainerbe.model.Exercise;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
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

    public String generateWorkoutAdvice(String gender, double bmi, String goal, String fitnessLevel, String lang) {
        if (apiKey == null || apiKey.isBlank() || apiKey.startsWith("AIzaSy_REPLACE")) {
            return null;
        }

        // gemini-2.0-* đã bị gỡ khỏi free tier (quota = 0) → dùng thế hệ 2.5
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";

        // Lời khuyên trả về theo ngôn ngữ UI của người dùng (hồ sơ user lưu giá trị tiếng Việt, Gemini tự hiểu).
        // Chỉ tóm tắt thể trạng + lợi ích của lộ trình — KHÔNG kê bài tập/loại hình tập
        // (lộ trình 28 ngày mới là thứ quyết định tập gì; kê thêm sẽ mâu thuẫn với lộ trình)
        String prompt = "en".equalsIgnoreCase(lang)
            ? String.format(
                "You are a personal trainer. Write 2-3 English sentences for this user: " +
                "Gender: %s, BMI: %.1f, Goal: %s, Level: %s. " +
                "Content: (1) briefly assess their current condition based on BMI and level " +
                "(e.g. underweight, balanced, overweight; has a foundation or just starting out); " +
                "(2) what their personalized 28-day roadmap will help them achieve (e.g. lose fat, stimulate muscle growth, build endurance). " +
                "STRICTLY do NOT name any exercises or training types (no cardio, squat, deadlift, strength sessions...), " +
                "do NOT give advice about workout frequency or sessions, and do NOT mention diet.",
                gender, bmi, goal, fitnessLevel)
            : String.format(
                "Bạn là huấn luyện viên cá nhân. Viết 2-3 câu tiếng Việt cho người dùng: " +
                "Giới tính: %s, BMI: %.1f, Mục tiêu: %s, Trình độ: %s. " +
                "Nội dung: (1) nhận xét ngắn thể trạng hiện tại dựa trên BMI và trình độ " +
                "(vd: đang gầy, cân đối, thừa cân; đã có nền tảng hay mới bắt đầu); " +
                "(2) lộ trình 28 ngày được cá nhân hóa này sẽ giúp họ đạt được gì (vd: giảm mỡ, kích thích cơ phát triển, tăng sức bền). " +
                "TUYỆT ĐỐI KHÔNG kể tên bài tập hay loại hình tập nào (không cardio, squat, deadlift, buổi tập sức mạnh...), " +
                "KHÔNG khuyên về số buổi tập, KHÔNG đề cập chế độ ăn.",
                gender, bmi, goal, fitnessLevel);

        Map<String, Object> requestBody = Map.of(
            "contents", List.of(Map.of(
                "parts", List.of(Map.of("text", prompt))
            ))
        );

        return callGeminiForText(url, requestBody);
    }

    /**
     * Chatbot pet huấn luyện viên (modal Chat AI trang Pet). Nhận lịch sử hội thoại nhiều lượt
     * (role: user/model) + tin nhắn mới, trả về câu trả lời hoặc null nếu key chưa cấu hình / Gemini lỗi.
     */
    public String chat(String gender, double bmi, String goal, String fitnessLevel,
                       String petName, List<Map<String, String>> history, String message, String lang) {
        if (apiKey == null || apiKey.isBlank() || apiKey.startsWith("AIzaSy_REPLACE")) {
            return null;
        }
        if (message == null || message.isBlank()) return null;

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";

        String replyLang = "en".equalsIgnoreCase(lang) ? "tiếng Anh (English)" : "tiếng Việt";
        String persona = String.format(
            "Bạn là \"%s\" — chú mèo thú cưng kiêm huấn luyện viên cá nhân trong ứng dụng fitness P.E.T. " +
            "Hồ sơ người dùng bạn đang huấn luyện: Giới tính: %s, BMI: %.1f, Mục tiêu: %s, Trình độ: %s. " +
            "Quy tắc: (1) Trả lời NGẮN GỌN 2-4 câu, thân thiện, đúng tính cách một chú mèo huấn luyện viên đáng yêu nhưng chuyên môn vững. " +
            "(2) Chỉ trả lời về tập luyện, dinh dưỡng, sức khỏe, phục hồi và cách dùng app P.E.T; chủ đề khác thì từ chối khéo léo và kéo về chuyện tập luyện. " +
            "(3) Không kê đơn thuốc hay chẩn đoán y tế; vấn đề sức khỏe nghiêm trọng thì khuyên gặp bác sĩ. " +
            "(4) Luôn trả lời bằng %s.",
            petName != null && !petName.isBlank() ? petName : "P.E.T",
            gender, bmi, goal, fitnessLevel, replyLang
        );

        // contents nhiều lượt: Gemini yêu cầu bắt đầu bằng lượt user → bỏ các lượt model dẫn đầu
        // (vd câu chào mặc định của pet); giới hạn 10 lượt gần nhất để prompt gọn
        List<Map<String, Object>> contents = new ArrayList<>();
        if (history != null) {
            int from = Math.max(0, history.size() - 10);
            boolean userSeen = false;
            for (int i = from; i < history.size(); i++) {
                Map<String, String> h = history.get(i);
                String role = "model".equals(h.get("role")) ? "model" : "user";
                String text = h.get("text");
                if (text == null || text.isBlank()) continue;
                if (!userSeen && "model".equals(role)) continue;
                userSeen = true;
                contents.add(Map.of("role", role, "parts", List.of(Map.of("text", text))));
            }
        }
        contents.add(Map.of("role", "user", "parts", List.of(Map.of("text", message))));

        Map<String, Object> requestBody = Map.of(
            "system_instruction", Map.of("parts", List.of(Map.of("text", persona))),
            "contents", contents
        );

        return callGeminiForText(url, requestBody);
    }

    /**
     * Sinh lộ trình 28 ngày bằng Gemini. Trả về danh sách 28 ngày (JSON snake_case)
     * hoặc null nếu key chưa cấu hình / Gemini lỗi / kết quả không hợp lệ
     * (frontend sẽ fallback về thuật toán local).
     */
    public List<Map<String, Object>> generateRoadmap(String gender, double bmi, String goal,
                                                     String fitnessLevel, List<Exercise> exercises) {
        if (apiKey == null || apiKey.isBlank() || apiKey.startsWith("AIzaSy_REPLACE")) {
            System.err.println("Gemini roadmap skipped: GEMINI_API_KEY is missing or placeholder");
            return null;
        }

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

        StringBuilder catalog = new StringBuilder();
        Set<String> validNames = new HashSet<>();
        for (Exercise ex : exercises) {
            if (ex.getName() == null) continue;
            validNames.add(normalizeName(ex.getName()));
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
            "6. Mỗi phần tử theo đúng schema (snake_case), các field *_en là bản dịch tiếng Anh của field tiếng Việt tương ứng:\n" +
            "{\"day\": 1, \"is_rest_day\": false, \"plan_title\": \"TÊN LỘ TRÌNH VIẾT HOA\", \"plan_title_en\": \"PLAN TITLE IN ENGLISH\", " +
            "\"quest\": \"Tên buổi tập ngắn gọn tiếng Việt\", \"quest_en\": \"Short session name in English\", " +
            "\"story_desc\": \"1 câu động viên tiếng Việt\", \"story_desc_en\": \"1 motivational sentence in English\", " +
            "\"duration\": 45, \"exercises\": [{\"name\": \"tên đúng trong danh sách\", \"sets\": 3, \"reps\": \"12\", \"rest\": \"60s\"}]}\n" +
            "Ngày nghỉ: is_rest_day=true, exercises=[], duration=0 (vẫn có đủ quest/quest_en/story_desc/story_desc_en).\n" +
            "\"plan_title\" và \"plan_title_en\" giống nhau cho cả 28 ngày. Chỉ trả về JSON, không giải thích gì thêm.",
            gender, bmi, goal, fitnessLevel, catalog
        );

        Map<String, Object> requestBody = Map.of(
            "contents", List.of(Map.of(
                "parts", List.of(Map.of("text", prompt))
            )),
            "generationConfig", Map.of("response_mime_type", "application/json")
        );

        String text = callGeminiForText(url, requestBody);
        if (text == null || text.isBlank()) return null;

        try {
            List<Map<String, Object>> days = objectMapper.readValue(text, new TypeReference<>() {});
            return validateRoadmap(days, validNames);
        } catch (Exception e) {
            System.err.println("Gemini roadmap parse error: " + e.getMessage());
            return null;
        }
    }

    /**
     * Gọi Gemini generateContent và trả về phần text của candidate đầu tiên (null nếu lỗi).
     * 429 (hết quota phút) và 503 (model quá tải) thường thoáng qua → tự retry 1 lần sau 2 giây.
     */
    private String callGeminiForText(String url, Map<String, Object> requestBody) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-goog-api-key", apiKey);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        for (int attempt = 1; attempt <= 2; attempt++) {
            try {
                ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
                if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) return null;

                List<?> candidates = (List<?>) response.getBody().get("candidates");
                if (candidates == null || candidates.isEmpty()) return null;
                Map<?, ?> content = (Map<?, ?>) ((Map<?, ?>) candidates.get(0)).get("content");
                if (content == null) return null;
                List<?> parts = (List<?>) content.get("parts");
                if (parts == null || parts.isEmpty()) return null;
                return (String) ((Map<?, ?>) parts.get(0)).get("text");
            } catch (HttpStatusCodeException e) {
                int code = e.getStatusCode().value();
                if ((code == 429 || code == 503) && attempt == 1) {
                    System.err.println("Gemini " + code + " on " + url + " - retrying once after 2s");
                    try {
                        Thread.sleep(2000);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        return null;
                    }
                    continue;
                }
                System.err.println("Gemini HTTP error " + e.getStatusCode() + ": " + e.getResponseBodyAsString());
                return null;
            } catch (Exception e) {
                System.err.println("Gemini API error: " + e.getMessage());
                return null;
            }
        }
        return null;
    }

    /**
     * Kiểm tra kết quả Gemini: đủ 28 ngày, loại bỏ bài tập có tên không khớp DB
     * (tên bài phải khớp tuyệt đối vì camera đếm rep, ảnh và nhiệm vụ Daily đều so theo tên).
     */
    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> validateRoadmap(List<Map<String, Object>> days, Set<String> validNames) {
        if (days == null || days.size() != 28) {
            System.err.println("Gemini roadmap rejected: expected 28 days, got " + (days == null ? "null" : days.size()));
            return null;
        }

        for (Map<String, Object> day : days) {
            boolean isRest = Boolean.TRUE.equals(day.get("is_rest_day"));
            if (isRest) {
                day.put("exercises", List.of());
                continue;
            }
            Object raw = day.get("exercises");
            List<Map<String, Object>> kept = new ArrayList<>();
            List<String> returnedNames = new ArrayList<>();
            if (raw instanceof List<?> list) {
                for (Object item : list) {
                    if (item instanceof Map<?, ?> exMap) {
                        Object name = exMap.get("name");
                        if (name instanceof String s) {
                            returnedNames.add(s);
                            // So khớp CHUẨN HÓA (bỏ ký tự không phải chữ/số) để bắt lệch format
                            // nhỏ như "Push-Up" vs "Push Up", tránh loại sạch cả lộ trình vì 1 ngày lệch tên
                            if (validNames.contains(normalizeName(s))) {
                                kept.add((Map<String, Object>) exMap);
                            }
                        }
                    }
                }
            }
            if (kept.isEmpty()) {
                // ngày tập mà không còn bài hợp lệ → coi như kết quả hỏng; log tên Gemini trả về để dò lệch
                System.err.println("Gemini roadmap rejected: day " + day.get("day") +
                    " has no exercise matching DB names. Gemini returned: " + returnedNames);
                return null;
            }
            day.put("exercises", kept);
        }
        return days;
    }

    // Chuẩn hóa tên bài để so khớp: lowercase + bỏ mọi ký tự không phải chữ/số
    // ("Push-Up", "push up", "Push  Up" → "pushup"). Dùng cho cả build danh sách hợp lệ lẫn tra cứu.
    private String normalizeName(String name) {
        if (name == null) return "";
        return name.trim().toLowerCase().replaceAll("[^a-z0-9]", "");
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
