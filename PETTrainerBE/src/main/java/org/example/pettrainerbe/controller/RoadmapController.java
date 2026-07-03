package org.example.pettrainerbe.controller;

import org.example.pettrainerbe.dto.RoadmapDTO;
import org.example.pettrainerbe.dto.RoadmapDayDTO;
import org.example.pettrainerbe.model.Roadmap;
import org.example.pettrainerbe.model.RoadmapDay;
import org.example.pettrainerbe.model.User;
import org.example.pettrainerbe.repository.RoadmapDayRepository;
import org.example.pettrainerbe.repository.RoadmapRepository;
import org.example.pettrainerbe.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/roadmaps")
public class RoadmapController {

    @Autowired private RoadmapRepository roadmapRepository;
    @Autowired private RoadmapDayRepository roadmapDayRepository;
    @Autowired private UserRepository userRepository;

    // ===== ROADMAP ENDPOINTS =====

    @GetMapping
    public List<RoadmapDTO> getAllRoadmaps() {
        return roadmapRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoadmapDTO> getRoadmapById(@PathVariable Integer id) {
        return roadmapRepository.findById(id)
                .map(r -> ResponseEntity.ok(toDTO(r)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public List<RoadmapDTO> getRoadmapsByUser(@PathVariable Integer userId) {
        return roadmapRepository.findByUserUserId(userId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<?> createRoadmap(@RequestBody RoadmapDTO dto) {
        User user = userRepository.findById(dto.getUserId()).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body("User không tồn tại");

        Roadmap roadmap = new Roadmap();
        roadmap.setUser(user);
        roadmap.setGoal(dto.getGoal());
        roadmap.setCreatedAt(dto.getCreatedAt() != null ? dto.getCreatedAt() : LocalDateTime.now());

        Roadmap saved = roadmapRepository.save(roadmap);
        return ResponseEntity.ok(toDTO(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRoadmap(@PathVariable Integer id, @RequestBody RoadmapDTO dto) {
        return roadmapRepository.findById(id).map(roadmap -> {
            if (dto.getGoal() != null) roadmap.setGoal(dto.getGoal());
            return ResponseEntity.ok(toDTO(roadmapRepository.save(roadmap)));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoadmap(@PathVariable Integer id) {
        if (!roadmapRepository.existsById(id)) return ResponseEntity.notFound().build();
        roadmapRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // ===== ROADMAP DAY ENDPOINTS =====

    @GetMapping("/{roadmapId}/days")
    public List<RoadmapDayDTO> getDaysByRoadmap(@PathVariable Integer roadmapId) {
        return roadmapDayRepository.findByRoadmapId(roadmapId).stream()
                .map(this::toDayDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/days/{id}")
    public ResponseEntity<RoadmapDayDTO> getDayById(@PathVariable Integer id) {
        return roadmapDayRepository.findById(id)
                .map(d -> ResponseEntity.ok(toDayDTO(d)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{roadmapId}/days")
    public ResponseEntity<?> addDay(@PathVariable Integer roadmapId, @RequestBody RoadmapDayDTO dto) {
        Roadmap roadmap = roadmapRepository.findById(roadmapId).orElse(null);
        if (roadmap == null) return ResponseEntity.badRequest().body("Roadmap không tồn tại");

        RoadmapDay day = new RoadmapDay();
        day.setRoadmap(roadmap);
        day.setDayNumber(dto.getDayNumber());
        day.setChallengeName(dto.getChallengeName());
        day.setDuration(dto.getDuration());
        day.setIsCompleted(dto.getIsCompleted() != null ? dto.getIsCompleted() : false);
        day.setKcal(dto.getKcal());
        day.setMuscleGroup(dto.getMuscleGroup());

        return ResponseEntity.ok(toDayDTO(roadmapDayRepository.save(day)));
    }

    @PutMapping("/days/{id}")
    public ResponseEntity<?> updateDay(@PathVariable Integer id, @RequestBody RoadmapDayDTO dto) {
        return roadmapDayRepository.findById(id).map(day -> {
            if (dto.getChallengeName() != null) day.setChallengeName(dto.getChallengeName());
            if (dto.getDayNumber() != null)     day.setDayNumber(dto.getDayNumber());
            if (dto.getDuration() != null)      day.setDuration(dto.getDuration());
            if (dto.getIsCompleted() != null)   day.setIsCompleted(dto.getIsCompleted());
            if (dto.getKcal() != null)          day.setKcal(dto.getKcal());
            if (dto.getMuscleGroup() != null)   day.setMuscleGroup(dto.getMuscleGroup());
            return ResponseEntity.ok(toDayDTO(roadmapDayRepository.save(day)));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/days/{id}")
    public ResponseEntity<Void> deleteDay(@PathVariable Integer id) {
        if (!roadmapDayRepository.existsById(id)) return ResponseEntity.notFound().build();
        roadmapDayRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // ===== CONVERTERS =====

    private RoadmapDTO toDTO(Roadmap r) {
        RoadmapDTO dto = new RoadmapDTO();
        dto.setId(r.getId());
        dto.setGoal(r.getGoal());
        dto.setCreatedAt(r.getCreatedAt());
        if (r.getUser() != null) dto.setUserId(r.getUser().getUserId());
        if (r.getDays() != null) {
            dto.setDays(r.getDays().stream().map(this::toDayDTO).collect(Collectors.toList()));
        }
        return dto;
    }

    private RoadmapDayDTO toDayDTO(RoadmapDay d) {
        RoadmapDayDTO dto = new RoadmapDayDTO();
        dto.setId(d.getId());
        dto.setDayNumber(d.getDayNumber());
        dto.setChallengeName(d.getChallengeName());
        dto.setDuration(d.getDuration());
        dto.setIsCompleted(d.getIsCompleted());
        dto.setKcal(d.getKcal());
        dto.setMuscleGroup(d.getMuscleGroup());
        if (d.getRoadmap() != null) dto.setRoadmapId(d.getRoadmap().getId());
        return dto;
    }
}
