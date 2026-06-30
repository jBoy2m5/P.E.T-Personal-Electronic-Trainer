package org.example.pettrainerbe.controller;

import org.example.pettrainerbe.dto.ExerciseDTO;
import org.example.pettrainerbe.model.Exercise;
import org.example.pettrainerbe.repository.ExerciseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/exercises")
public class ExerciseController {

    @Autowired
    private ExerciseRepository exerciseRepository;

    @GetMapping
    public List<ExerciseDTO> getAllExercises() {
        return exerciseRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExerciseDTO> getExerciseById(@PathVariable Integer id) {
        return exerciseRepository.findById(id)
                .map(exercise -> ResponseEntity.ok(convertToDTO(exercise)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ExerciseDTO> createExercise(@RequestBody Exercise exercise) {
        Exercise savedExercise = exerciseRepository.save(exercise);
        return ResponseEntity.ok(convertToDTO(savedExercise));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExerciseDTO> updateExercise(@PathVariable Integer id, @RequestBody Exercise exerciseDetails) {
        return exerciseRepository.findById(id)
                .map(exercise -> {
                    exercise.setName(exerciseDetails.getName());
                    exercise.setTechnicalDescription(exerciseDetails.getTechnicalDescription());
                    exercise.setSafetyNotes(exerciseDetails.getSafetyNotes());
                    exercise.setMediaUrl(exerciseDetails.getMediaUrl());
                    exercise.setStandardAngles(exerciseDetails.getStandardAngles());
                    exercise.setEstimatedCaloriesPerRep(exerciseDetails.getEstimatedCaloriesPerRep());
                    exercise.setReps(exerciseDetails.getReps());
                    exercise.setSets(exerciseDetails.getSets());
                    exercise.setLevel(exerciseDetails.getLevel());
                    exercise.setVideoUrl(exerciseDetails.getVideoUrl());
                    if (exerciseDetails.getMuscleGroup() != null) {
                        exercise.setMuscleGroup(exerciseDetails.getMuscleGroup());
                    }
                    return ResponseEntity.ok(convertToDTO(exerciseRepository.save(exercise)));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExercise(@PathVariable Integer id) {
        if (exerciseRepository.existsById(id)) {
            exerciseRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    private ExerciseDTO convertToDTO(Exercise exercise) {
        ExerciseDTO dto = new ExerciseDTO();
        dto.setExerciseId(exercise.getExerciseId());
        dto.setName(exercise.getName());
        dto.setTechnicalDescription(exercise.getTechnicalDescription());
        dto.setSafetyNotes(exercise.getSafetyNotes());
        dto.setMediaUrl(exercise.getMediaUrl());
        dto.setStandardAngles(exercise.getStandardAngles());
        dto.setEstimatedCaloriesPerRep(exercise.getEstimatedCaloriesPerRep());
        dto.setReps(exercise.getReps());
        dto.setSets(exercise.getSets());
        dto.setLevel(exercise.getLevel());
        dto.setVideoUrl(exercise.getVideoUrl());
        dto.setIsJump(exercise.getIsJump());
        if (exercise.getMuscleGroup() != null) {
            dto.setMuscleGroupId(exercise.getMuscleGroup().getGroupId());
            dto.setMuscleGroupName(exercise.getMuscleGroup().getName());
        }
        Float kcalPerRep = exercise.getEstimatedCaloriesPerRep() != null ? exercise.getEstimatedCaloriesPerRep() : 0f;
        Integer reps = exercise.getReps() != null ? exercise.getReps() : 0;
        Integer sets = exercise.getSets() != null ? exercise.getSets() : 0;
        dto.setKcal(kcalPerRep * reps * sets);
        return dto;
    }
}