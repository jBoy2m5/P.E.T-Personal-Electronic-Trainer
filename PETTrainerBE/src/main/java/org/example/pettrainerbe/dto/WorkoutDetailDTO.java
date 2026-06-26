package org.example.pettrainerbe.dto;

import lombok.Data;
import java.util.List;

@Data
public class WorkoutDetailDTO {
    private Integer detailId;
    private Integer repsCompleted;
    private Integer sessionId; // Chỉ lấy ID của Session
    private ExerciseDTO exercise; // Dùng ExerciseShortDTO đã tạo ở phần trước
    private List<ErrorLogDTO> errorLogs;
}