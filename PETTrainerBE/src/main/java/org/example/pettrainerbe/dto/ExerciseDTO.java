package org.example.pettrainerbe.dto;

import lombok.Data;

@Data
public class ExerciseDTO {
    private Integer exerciseId;
    private String name;
    private String technicalDescription;
    private String safetyNotes;
    private String mediaUrl;
    private String standardAngles;
    private Float estimatedCaloriesPerRep;
}