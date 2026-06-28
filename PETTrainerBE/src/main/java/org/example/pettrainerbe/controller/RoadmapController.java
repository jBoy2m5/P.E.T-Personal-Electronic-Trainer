package org.example.pettrainerbe.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.pettrainerbe.model.Roadmap;
import org.example.pettrainerbe.model.RoadmapDay;
import org.example.pettrainerbe.model.User;
import org.example.pettrainerbe.repository.RoadmapDayRepository;
import org.example.pettrainerbe.repository.RoadmapRepository;
import org.example.pettrainerbe.repository.UserRepository;
import org.example.pettrainerbe.service.GeminiAiService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/roadmaps")
public class RoadmapController {

    private final RoadmapRepository roadmapRepository;
    private final RoadmapDayRepository roadmapDayRepository;
    private final UserRepository userRepository;
    private final GeminiAiService geminiAiService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public RoadmapController(RoadmapRepository roadmapRepository, RoadmapDayRepository roadmapDayRepository,
                             UserRepository userRepository, GeminiAiService geminiAiService) {
        this.roadmapRepository = roadmapRepository;
        this.roadmapDayRepository = roadmapDayRepository;
        this.userRepository = userRepository;
        this.geminiAiService = geminiAiService;
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generateRoadmap() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(email);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
            }

            // Call AI
            String jsonResponse = geminiAiService.generateRoadmapJson(user);
            if (jsonResponse == null || jsonResponse.isBlank()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to get response from AI");
            }

            // Parse JSON array
            List<Map<String, Object>> daysList = objectMapper.readValue(jsonResponse, new TypeReference<List<Map<String, Object>>>() {});

            if (daysList.size() != 28) {
                System.out.println("Warning: AI did not return exactly 28 days. It returned " + daysList.size() + " days.");
            }

            // Create Roadmap
            Roadmap roadmap = new Roadmap();
            roadmap.setUser(user);
            roadmap.setGoal(user.getFitnessGoal() != null ? user.getFitnessGoal() : "Cải thiện sức khỏe");
            roadmap = roadmapRepository.save(roadmap);

            // Create RoadmapDays
            for (Map<String, Object> dayData : daysList) {
                RoadmapDay rd = new RoadmapDay();
                rd.setRoadmap(roadmap);
                rd.setDayNumber(dayData.get("dayNumber") != null ? Integer.parseInt(dayData.get("dayNumber").toString()) : 0);
                rd.setMuscleGroup(dayData.get("muscleGroup") != null ? dayData.get("muscleGroup").toString() : "");
                rd.setChallengeName(dayData.get("challengeName") != null ? dayData.get("challengeName").toString() : "");
                rd.setDuration(dayData.get("duration") != null ? Integer.parseInt(dayData.get("duration").toString()) : 0);
                rd.setKcal(dayData.get("kcal") != null ? Integer.parseInt(dayData.get("kcal").toString()) : 0);
                rd.setIsCompleted(false);
                roadmapDayRepository.save(rd);
            }

            return ResponseEntity.ok(Map.of("status", "success", "message", "Đã tạo lộ trình 28 ngày thành công", "roadmapId", roadmap.getId()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/my-roadmap")
    public ResponseEntity<?> getMyRoadmap() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(email);
            if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

            Roadmap latestRoadmap = roadmapRepository.findTopByUserUserIdOrderByCreatedAtDesc(user.getUserId());
            if (latestRoadmap == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Chưa có lộ trình nào"));
            }

            List<RoadmapDay> days = roadmapDayRepository.findByRoadmapIdOrderByDayNumberAsc(latestRoadmap.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("roadmapId", latestRoadmap.getId());
            response.put("goal", latestRoadmap.getGoal());
            response.put("days", days);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/days/{dayId}/complete")
    public ResponseEntity<?> completeDay(@PathVariable Integer dayId) {
        try {
            RoadmapDay day = roadmapDayRepository.findById(dayId).orElse(null);
            if (day == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy ngày này");
            }
            
            // Should also verify if this day belongs to the logged in user
            day.setIsCompleted(true);
            roadmapDayRepository.save(day);

            return ResponseEntity.ok(Map.of("status", "success", "message", "Đã cập nhật trạng thái hoàn thành"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }
}
