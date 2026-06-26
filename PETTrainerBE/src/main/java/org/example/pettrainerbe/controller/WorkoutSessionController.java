package org.example.pettrainerbe.controller;

import org.example.pettrainerbe.dto.ErrorLogDTO;
import org.example.pettrainerbe.dto.ExerciseDTO;
import org.example.pettrainerbe.dto.WorkoutDetailDTO;
import org.example.pettrainerbe.dto.WorkoutSessionDTO;
import org.example.pettrainerbe.model.WorkoutSession;
import org.example.pettrainerbe.repository.WorkoutSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/workout-sessions")
public class WorkoutSessionController {

    @Autowired
    private WorkoutSessionRepository workoutSessionRepository;

    @GetMapping
    public List<WorkoutSessionDTO> getAllSessions() {
        return workoutSessionRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkoutSessionDTO> getSessionById(@PathVariable Integer id) {
        return workoutSessionRepository.findById(id)
                .map(session -> ResponseEntity.ok(convertToDTO(session)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<WorkoutSessionDTO> createSession(@RequestBody WorkoutSession session) {
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
                    ExerciseDTO exDto = new ExerciseDTO();
                    exDto.setExerciseId(detail.getExercise().getExerciseId());
                    exDto.setName(detail.getExercise().getName());
                    exDto.setTechnicalDescription(detail.getExercise().getTechnicalDescription());
                    exDto.setSafetyNotes(detail.getExercise().getSafetyNotes());
                    exDto.setMediaUrl(detail.getExercise().getMediaUrl());
                    exDto.setStandardAngles(detail.getExercise().getStandardAngles());
                    exDto.setEstimatedCaloriesPerRep(detail.getExercise().getEstimatedCaloriesPerRep());
                    detailDto.setExercise(exDto);
                }

                if (detail.getErrorLogs() != null) {
                    List<ErrorLogDTO> logDTOs = detail.getErrorLogs().stream().map(log -> {
                        ErrorLogDTO logDto = new ErrorLogDTO();
                        logDto.setLogId(log.getLogId());
                        logDto.setErrorDescription(log.getErrorDescription());
                        logDto.setKeypointsData(log.getKeypointsData());
                        logDto.setCreatedAt(log.getCreatedAt());
                        logDto.setDetailId(detail.getDetailId());
                        return logDto;
                    }).collect(Collectors.toList());
                    detailDto.setErrorLogs(logDTOs);
                }
                return detailDto;
            }).collect(Collectors.toList());
            dto.setWorkoutDetails(detailDTOs);
        }
        return dto;
    }
}