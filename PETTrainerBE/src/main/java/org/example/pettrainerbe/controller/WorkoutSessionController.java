package org.example.pettrainerbe.controller;

import org.example.pettrainerbe.dto.ExerciseDTO;
import org.example.pettrainerbe.dto.WorkoutDetailDTO;
import org.example.pettrainerbe.dto.WorkoutSessionDTO;
import org.example.pettrainerbe.model.Exercise;
import org.example.pettrainerbe.model.User;
import org.example.pettrainerbe.model.WorkoutDetail;
import org.example.pettrainerbe.model.WorkoutSession;
import org.example.pettrainerbe.repository.ExerciseRepository;
import org.example.pettrainerbe.repository.UserRepository;
import org.example.pettrainerbe.repository.WorkoutSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/workout-sessions")
public class WorkoutSessionController {

    @Autowired
    private WorkoutSessionRepository workoutSessionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExerciseRepository exerciseRepository;

    @GetMapping
    public List<WorkoutSessionDTO> getAllSessions() {
        return workoutSessionRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/today")
    public ResponseEntity<List<WorkoutSessionDTO>> getTodaySessions() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        List<WorkoutSessionDTO> sessions = workoutSessionRepository
                .findByUser_UserIdAndStartTimeBetween(user.getUserId(), startOfDay, endOfDay)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/me")
    public ResponseEntity<List<WorkoutSessionDTO>> getMySessions() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<WorkoutSessionDTO> sessions = workoutSessionRepository
                .findByUser_UserId(user.getUserId())
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkoutSessionDTO> getSessionById(@PathVariable Integer id) {
        return workoutSessionRepository.findById(id)
                .map(session -> ResponseEntity.ok(convertToDTO(session)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<WorkoutSessionDTO> createSession(@RequestBody WorkoutSession session) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        session.setUser(user);

        if (session.getWorkoutDetails() != null) {
            List<WorkoutDetail> validDetails = new ArrayList<>();
            for (WorkoutDetail detail : session.getWorkoutDetails()) {
                if (detail.getExercise() == null || detail.getExercise().getExerciseId() == null) {
                    continue;
                }
                Exercise exercise = exerciseRepository.findById(detail.getExercise().getExerciseId()).orElse(null);
                if (exercise == null) {
                    continue;
                }
                detail.setExercise(exercise);
                detail.setWorkoutSession(session);
                validDetails.add(detail);
            }
            session.setWorkoutDetails(validDetails);
        }

        WorkoutSession savedSession = workoutSessionRepository.save(session);
        return ResponseEntity.ok(convertToDTO(savedSession));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkoutSessionDTO> updateSession(@PathVariable Integer id, @RequestBody WorkoutSession sessionDetails) {
        return workoutSessionRepository.findById(id)
                .map(session -> {
                    session.setStartTime(sessionDetails.getStartTime());
                    session.setEndTime(sessionDetails.getEndTime());
                    session.setTotalCaloriesBurned(sessionDetails.getTotalCaloriesBurned());
                    session.setTotalValidReps(sessionDetails.getTotalValidReps());
                    if (sessionDetails.getUser() != null) {
                        session.setUser(sessionDetails.getUser());
                    }
                    return ResponseEntity.ok(convertToDTO(workoutSessionRepository.save(session)));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable Integer id) {
        if (workoutSessionRepository.existsById(id)) {
            workoutSessionRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // --- MAPPING ---
    private WorkoutSessionDTO convertToDTO(WorkoutSession session) {
        WorkoutSessionDTO dto = new WorkoutSessionDTO();
        dto.setSessionId(session.getSessionId());
        dto.setStartTime(session.getStartTime());
        dto.setEndTime(session.getEndTime());
        dto.setTotalCaloriesBurned(session.getTotalCaloriesBurned());
        dto.setTotalValidReps(session.getTotalValidReps());

        if (session.getUser() != null) {
            dto.setUserId(session.getUser().getUserId());
        }

        if (session.getWorkoutDetails() != null) {
            List<WorkoutDetailDTO> detailDTOs = session.getWorkoutDetails().stream().map(detail -> {
                WorkoutDetailDTO detailDto = new WorkoutDetailDTO();
                detailDto.setDetailId(detail.getDetailId());
                detailDto.setRepsCompleted(detail.getRepsCompleted());
                detailDto.setSessionId(session.getSessionId());

                if (detail.getExercise() != null) {
                    // Chỉ trả các field frontend dùng (name, media_url) — mô tả/góc chuẩn rất nặng và không cần trong lịch sử buổi tập
                    ExerciseDTO exDto = new ExerciseDTO();
                    exDto.setExerciseId(detail.getExercise().getExerciseId());
                    exDto.setName(detail.getExercise().getName());
                    exDto.setMediaUrl(detail.getExercise().getMediaUrl());
                    detailDto.setExercise(exDto);
                }
                return detailDto;
            }).collect(Collectors.toList());
            dto.setWorkoutDetails(detailDTOs);
        }
        return dto;
    }
}