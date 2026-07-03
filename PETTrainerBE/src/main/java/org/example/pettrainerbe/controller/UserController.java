package org.example.pettrainerbe.controller;

import org.example.pettrainerbe.model.User;
import org.example.pettrainerbe.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email);
        if (user == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");

        // Trả DTO gọn (chỉ field hồ sơ) thay vì cả entity: serialize nguyên object graph
        // (pet, workoutSessions → details → exercise...) tạo response ~MB và có thể bị cắt giữa
        // chừng khi Jackson lỗi sâu trong graph → JSON không hợp lệ. Axios giữ chuỗi méo đó dưới
        // dạng string (không throw) → mọi field FE đọc thành undefined ("Người dùng" + ép onboarding).
        // Key để snake_case cứng cho khớp useAuthStore + profileApi.
        Map<String, Object> me = new HashMap<>();
        me.put("user_id", user.getUserId());
        me.put("name", user.getName());
        me.put("email", user.getEmail());
        me.put("picture_url", user.getPictureUrl());
        me.put("height", user.getHeight());
        me.put("weight", user.getWeight());
        me.put("bmi", user.getBmi());
        me.put("gender", user.getGender());
        me.put("fitness_goal", user.getFitnessGoal());
        me.put("fitness_level", user.getFitnessLevel());
        me.put("sessions_per_week", user.getSessionsPerWeek());
        return ResponseEntity.ok(me);
    }

    @PutMapping("/avatar")
    public ResponseEntity<?> updateAvatar(@RequestBody Map<String, Object> payload) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email);
        if (user == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");

        if (payload.containsKey("picture_url")) {
            user.setPictureUrl((String) payload.get("picture_url"));
            userRepository.save(user);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("picture_url", user.getPictureUrl());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/onboarding")
    public ResponseEntity<?> updateOnboarding(@RequestBody Map<String, Object> payload) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(email);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }

            if (payload.containsKey("gender")) user.setGender((String) payload.get("gender"));
            if (payload.containsKey("fitnessLevel")) user.setFitnessLevel((String) payload.get("fitnessLevel"));
            if (payload.containsKey("goal")) user.setFitnessGoal((String) payload.get("goal"));
            
            if (payload.containsKey("height")) {
                user.setHeight(Float.valueOf(payload.get("height").toString()));
            }
            if (payload.containsKey("weight")) {
                user.setWeight(Float.valueOf(payload.get("weight").toString()));
            }
            if (payload.containsKey("sessionsPerWeek")) {
                user.setSessionsPerWeek(Integer.valueOf(payload.get("sessionsPerWeek").toString()));
            }
            
            if (user.getHeight() != null && user.getWeight() != null && user.getHeight() > 0) {
                float heightM = user.getHeight() / 100.0f;
                float bmi = user.getWeight() / (heightM * heightM);
                user.setBmi(bmi);
            }

            userRepository.save(user);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Cập nhật dữ liệu onboarding thành công");
            
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("userId", user.getUserId());
            userMap.put("email", user.getEmail());
            userMap.put("name", user.getName());
            userMap.put("pictureUrl", user.getPictureUrl());
            userMap.put("height", user.getHeight());
            userMap.put("weight", user.getWeight());
            userMap.put("bmi", user.getBmi());
            userMap.put("goal", user.getFitnessGoal());
            userMap.put("gender", user.getGender());
            userMap.put("fitnessLevel", user.getFitnessLevel());
            userMap.put("sessionsPerWeek", user.getSessionsPerWeek());
            response.put("user", userMap);

            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }
}