package org.example.pettrainerbe.controller;

import org.example.pettrainerbe.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/db")
public class DatabaseController {

    @Autowired private ErrorLogRepository errorLogRepository;
    @Autowired private WorkoutDetailRepository workoutDetailRepository;
    @Autowired private WorkoutSessionRepository workoutSessionRepository;
    @Autowired private ExerciseRepository exerciseRepository;
    @Autowired private PetRepository petRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private MuscleGroupRepository muscleGroupRepository;
    @Autowired private RoadmapDayRepository roadmapDayRepository;
    @Autowired private RoadmapRepository roadmapRepository;

    // Xóa toàn bộ database theo đúng thứ tự FK
    @DeleteMapping("/reset")
    @Transactional
    public ResponseEntity<String> resetDatabase() {
        errorLogRepository.deleteAll();
        workoutDetailRepository.deleteAll();
        workoutSessionRepository.deleteAll();
        roadmapDayRepository.deleteAll();
        roadmapRepository.deleteAll();
        exerciseRepository.deleteAll();
        petRepository.deleteAll();
        userRepository.deleteAll();
        muscleGroupRepository.deleteAll();
        return ResponseEntity.ok("✅ Đã xóa toàn bộ dữ liệu database");
    }

    // Xóa error_logs
    @DeleteMapping("/error-logs")
    @Transactional
    public ResponseEntity<String> deleteErrorLogs() {
        errorLogRepository.deleteAll();
        return ResponseEntity.ok("✅ Đã xóa toàn bộ error_logs");
    }

    // Xóa workout_details (cần xóa error_logs trước vì FK)
    @DeleteMapping("/workout-details")
    @Transactional
    public ResponseEntity<String> deleteWorkoutDetails() {
        errorLogRepository.deleteAll();
        workoutDetailRepository.deleteAll();
        return ResponseEntity.ok("✅ Đã xóa toàn bộ workout_details");
    }

    // Xóa workout_sessions (cascade → workout_details → error_logs)
    @DeleteMapping("/workout-sessions")
    @Transactional
    public ResponseEntity<String> deleteWorkoutSessions() {
        errorLogRepository.deleteAll();
        workoutDetailRepository.deleteAll();
        workoutSessionRepository.deleteAll();
        return ResponseEntity.ok("✅ Đã xóa toàn bộ workout_sessions");
    }

    // Xóa exercises (cần xóa workout_details trước vì FK exercise_id)
    @DeleteMapping("/exercises")
    @Transactional
    public ResponseEntity<String> deleteExercises() {
        errorLogRepository.deleteAll();
        workoutDetailRepository.deleteAll();
        exerciseRepository.deleteAll();
        return ResponseEntity.ok("✅ Đã xóa toàn bộ exercises");
    }

    // Xóa muscle_groups (cascade → exercises → workout_details → error_logs)
    @DeleteMapping("/muscle-groups")
    @Transactional
    public ResponseEntity<String> deleteMuscleGroups() {
        errorLogRepository.deleteAll();
        workoutDetailRepository.deleteAll();
        exerciseRepository.deleteAll();
        muscleGroupRepository.deleteAll();
        return ResponseEntity.ok("✅ Đã xóa toàn bộ muscle_groups");
    }

    // Xóa pets
    @DeleteMapping("/pets")
    @Transactional
    public ResponseEntity<String> deletePets() {
        petRepository.deleteAll();
        return ResponseEntity.ok("✅ Đã xóa toàn bộ pets");
    }

    // Xóa roadmap_days
    @DeleteMapping("/roadmap-days")
    @Transactional
    public ResponseEntity<String> deleteRoadmapDays() {
        roadmapDayRepository.deleteAll();
        return ResponseEntity.ok("✅ Đã xóa toàn bộ roadmap_days");
    }

    // Xóa roadmaps (cascade → roadmap_days)
    @DeleteMapping("/roadmaps")
    @Transactional
    public ResponseEntity<String> deleteRoadmaps() {
        roadmapDayRepository.deleteAll();
        roadmapRepository.deleteAll();
        return ResponseEntity.ok("✅ Đã xóa toàn bộ roadmaps");
    }

    // Xóa users (cascade → pets, workout_sessions, roadmaps và toàn bộ con cháu)
    @DeleteMapping("/users")
    @Transactional
    public ResponseEntity<String> deleteUsers() {
        errorLogRepository.deleteAll();
        workoutDetailRepository.deleteAll();
        workoutSessionRepository.deleteAll();
        roadmapDayRepository.deleteAll();
        roadmapRepository.deleteAll();
        petRepository.deleteAll();
        userRepository.deleteAll();
        return ResponseEntity.ok("✅ Đã xóa toàn bộ users");
    }
}
