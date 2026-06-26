package org.example.pettrainerbe.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class WorkoutSessionDTO {
    private Integer sessionId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Float totalCaloriesBurned;
    private Integer totalValidReps;
    private Integer userId; // Chỉ lấy ID của User
    private List<WorkoutDetailDTO> workoutDetails;
}