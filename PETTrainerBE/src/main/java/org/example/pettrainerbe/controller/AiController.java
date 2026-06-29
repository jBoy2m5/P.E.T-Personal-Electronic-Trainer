package org.example.pettrainerbe.controller;

import org.example.pettrainerbe.model.User;
import org.example.pettrainerbe.repository.UserRepository;
import org.example.pettrainerbe.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private UserRepository userRepository;

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
}
