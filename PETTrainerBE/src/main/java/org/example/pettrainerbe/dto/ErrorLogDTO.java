package org.example.pettrainerbe.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ErrorLogDTO {
    private Integer logId;
    private String errorDescription;
    private String keypointsData;
    private LocalDateTime createdAt;
    private Integer detailId; // Chỉ lấy ID của WorkoutDetail
}