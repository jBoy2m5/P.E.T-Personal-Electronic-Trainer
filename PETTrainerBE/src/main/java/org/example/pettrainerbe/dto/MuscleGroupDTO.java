package org.example.pettrainerbe.dto;

import lombok.Data;
import java.util.List;

@Data
public class MuscleGroupDTO {
    private Integer groupId;
    private String name;
    private String description;

    // Sử dụng ExerciseDTO đã đồng bộ hóa
    private List<ExerciseDTO> exercises;
}