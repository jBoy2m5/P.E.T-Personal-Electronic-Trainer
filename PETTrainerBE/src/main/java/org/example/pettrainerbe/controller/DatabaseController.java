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

    @DeleteMapping("/reset")
    @Transactional // Đảm bảo tất cả lệnh xóa thành công, nếu 1 cái lỗi thì rollback lại
    public ResponseEntity<String> resetDatabase() {
        // Xóa theo thứ tự từ Con lên Cha
        errorLogRepository.deleteAll();
        workoutDetailRepository.deleteAll();
        workoutSessionRepository.deleteAll();
        exerciseRepository.deleteAll();
        petRepository.deleteAll();
        userRepository.deleteAll();
        muscleGroupRepository.deleteAll();

        return ResponseEntity.ok("Deleted all data in database");
    }
}

// Editted