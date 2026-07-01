package org.example.pettrainerbe.dto;

import lombok.Data;

@Data
public class ExerciseDTO {
    private Integer exerciseId;
    private String name;
    private String technicalDescription;
    private String safetyNotes;
    private String technicalDescriptionVi;
    private String safetyNotesVi;
    private String mediaUrl;
    private String standardAngles;
    private Float estimatedCaloriesPerRep;
    private Integer reps;
    private Integer sets;
    private String level;
    private String videoUrl;
    private Float kcal;
    private Boolean isJump;
    private String aiMode;
    private Integer muscleGroupId;
    private String muscleGroupName;
}