package org.example.pettrainerbe.controller;

import org.example.pettrainerbe.dto.ErrorLogDTO;
import org.example.pettrainerbe.dto.ExerciseDTO;
import org.example.pettrainerbe.dto.WorkoutDetailDTO;
import org.example.pettrainerbe.model.WorkoutDetail;
import org.example.pettrainerbe.repository.WorkoutDetailRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/workout-details")
public class WorkoutDetailController {

    @Autowired
    private WorkoutDetailRepository workoutDetailRepository;

    @GetMapping
    public List<WorkoutDetailDTO> getAllDetails() {
        return workoutDetailRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkoutDetailDTO> getDetailById(@PathVariable Integer id) {
        return workoutDetailRepository.findById(id)
                .map(detail -> ResponseEntity.ok(convertToDTO(detail)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<WorkoutDetailDTO> createDetail(@RequestBody WorkoutDetail detail) {
        WorkoutDetail savedDetail = workoutDetailRepository.save(detail);
        return ResponseEntity.ok(convertToDTO(savedDetail));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkoutDetailDTO> updateDetail(@PathVariable Integer id, @RequestBody WorkoutDetail detailUpdates) {
        return workoutDetailRepository.findById(id)
                .map(detail -> {
                    detail.setRepsCompleted(detailUpdates.getRepsCompleted());
                    if (detailUpdates.getWorkoutSession() != null) {
                        detail.setWorkoutSession(detailUpdates.getWorkoutSession());
                    }
                    if (detailUpdates.getExercise() != null) {
                        detail.setExercise(detailUpdates.getExercise());
                    }
                    return ResponseEntity.ok(convertToDTO(workoutDetailRepository.save(detail)));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDetail(@PathVariable Integer id) {
        if (workoutDetailRepository.existsById(id)) {
            workoutDetailRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // --- MAPPING ---
    private WorkoutDetailDTO convertToDTO(WorkoutDetail detail) {
        WorkoutDetailDTO dto = new WorkoutDetailDTO();
        dto.setDetailId(detail.getDetailId());
        dto.setRepsCompleted(detail.getRepsCompleted());

        if (detail.getWorkoutSession() != null) {
            dto.setSessionId(detail.getWorkoutSession().getSessionId());
        }

        if (detail.getExercise() != null) {
            ExerciseDTO exDto = new ExerciseDTO();
            exDto.setExerciseId(detail.getExercise().getExerciseId());
            exDto.setName(detail.getExercise().getName());
            exDto.setTechnicalDescription(detail.getExercise().getTechnicalDescription());
            exDto.setSafetyNotes(detail.getExercise().getSafetyNotes());
            exDto.setMediaUrl(detail.getExercise().getMediaUrl());
            exDto.setStandardAngles(detail.getExercise().getStandardAngles());
            exDto.setEstimatedCaloriesPerRep(detail.getExercise().getEstimatedCaloriesPerRep());
            dto.setExercise(exDto);
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
            dto.setErrorLogs(logDTOs);
        }
        return dto;
    }
}