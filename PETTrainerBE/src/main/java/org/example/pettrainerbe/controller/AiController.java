package org.example.pettrainerbe.controller;

import org.example.pettrainerbe.model.User;
import org.example.pettrainerbe.repository.ExerciseRepository;
import org.example.pettrainerbe.repository.UserRepository;
import org.example.pettrainerbe.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExerciseRepository exerciseRepository;

    @GetMapping("/roadmap-advice")
    public ResponseEntity<?> getRoadmapAdvice() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email);

        if (user == null) {
            return ResponseEntity.ok(Map.of("advice", ""));
        }

        double bmi = user.getBmi() != null ? user.getBmi().doubleValue() : 22.0;
        String advice = geminiService.generateWorkoutAdvice(
            user.getGender() != null ? user.getGender() : "Nam",
            bmi,
            user.getFitnessGoal() != null ? user.getFitnessGoal() : "Tăng cơ nạc",
            user.getFitnessLevel() != null ? user.getFitnessLevel() : "Mới bắt đầu"
        );

        return ResponseEntity.ok(Map.of("advice", advice != null ? advice : ""));
    }

    /**
     * Sinh lộ trình 28 ngày bằng Gemini từ hồ sơ user + danh sách bài tập trong DB.
     * Trả về {"roadmap": [...28 ngày...]} hoặc {"roadmap": null} nếu AI lỗi
     * (frontend tự fallback về thuật toán local).
     */
    @PostMapping("/generate-roadmap")
    public ResponseEntity<?> generateRoadmap() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email);

        Map<String, Object> result = new HashMap<>();
        if (user == null) {
            result.put("roadmap", null);
            return ResponseEntity.ok(result);
        }

        double bmi = user.getBmi() != null ? user.getBmi().doubleValue() : 22.0;
        List<Map<String, Object>> roadmap = geminiService.generateRoadmap(
            user.getGender() != null ? user.getGender() : "Nam",
            bmi,
            user.getFitnessGoal() != null ? user.getFitnessGoal() : "Tăng cơ nạc",
            user.getFitnessLevel() != null ? user.getFitnessLevel() : "Mới bắt đầu",
            exerciseRepository.findAll()
        );

        result.put("roadmap", roadmap);
        return ResponseEntity.ok(result);
    }
}
