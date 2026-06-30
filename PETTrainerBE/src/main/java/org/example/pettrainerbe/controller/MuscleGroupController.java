package org.example.pettrainerbe.controller;

import org.example.pettrainerbe.dto.ExerciseDTO;
import org.example.pettrainerbe.dto.MuscleGroupDTO;
import org.example.pettrainerbe.model.MuscleGroup;
import org.example.pettrainerbe.repository.MuscleGroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/muscle-groups")
public class MuscleGroupController {

    @Autowired
    private MuscleGroupRepository muscleGroupRepository;

    @GetMapping
    public List<MuscleGroupDTO> getAllMuscleGroups() {
        return muscleGroupRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MuscleGroupDTO> getMuscleGroupById(@PathVariable Integer id) {
        return muscleGroupRepository.findById(id)
                .map(group -> ResponseEntity.ok(convertToDTO(group)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<MuscleGroupDTO> createMuscleGroup(@RequestBody MuscleGroup muscleGroup) {
        MuscleGroup savedGroup = muscleGroupRepository.save(muscleGroup);
        return ResponseEntity.ok(convertToDTO(savedGroup));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MuscleGroupDTO> updateMuscleGroup(@PathVariable Integer id, @RequestBody MuscleGroup details) {
        return muscleGroupRepository.findById(id)
                .map(group -> {
                    group.setName(details.getName());
                    group.setDescription(details.getDescription());
                    return ResponseEntity.ok(convertToDTO(muscleGroupRepository.save(group)));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMuscleGroup(@PathVariable Integer id) {
        if (muscleGroupRepository.existsById(id)) {
            muscleGroupRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    private MuscleGroupDTO convertToDTO(MuscleGroup group) {
        MuscleGroupDTO dto = new MuscleGroupDTO();
        dto.setGroupId(group.getGroupId());
        dto.setName(group.getName());
        dto.setDescription(group.getDescription());

        if (group.getExercises() != null) {
            List<ExerciseDTO> exerciseDTOs = group.getExercises().stream()
                    .map(ex -> {
                        ExerciseDTO eDto = new ExerciseDTO();
                        eDto.setExerciseId(ex.getExerciseId());
                        eDto.setName(ex.getName());
                        eDto.setTechnicalDescription(ex.getTechnicalDescription());
                        eDto.setSafetyNotes(ex.getSafetyNotes());
                        eDto.setMediaUrl(ex.getMediaUrl());
                        eDto.setStandardAngles(ex.getStandardAngles());
                        eDto.setEstimatedCaloriesPerRep(ex.getEstimatedCaloriesPerRep());
                        eDto.setReps(ex.getReps());
                        eDto.setSets(ex.getSets());
                        eDto.setLevel(ex.getLevel());
                        eDto.setVideoUrl(ex.getVideoUrl());
                        eDto.setIsJump(ex.getIsJump());
                        eDto.setMuscleGroupId(group.getGroupId());
                        eDto.setMuscleGroupName(group.getName());
                        Float kcalPerRep = ex.getEstimatedCaloriesPerRep() != null ? ex.getEstimatedCaloriesPerRep() : 0f;
                        Integer reps = ex.getReps() != null ? ex.getReps() : 0;
                        Integer sets = ex.getSets() != null ? ex.getSets() : 0;
                        eDto.setKcal(kcalPerRep * reps * sets);
                        return eDto;
                    })
                    .collect(Collectors.toList());
            dto.setExercises(exerciseDTOs);
        }
        return dto;
    }
}