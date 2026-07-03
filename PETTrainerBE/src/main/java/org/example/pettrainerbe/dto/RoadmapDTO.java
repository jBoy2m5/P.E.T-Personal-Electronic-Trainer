package org.example.pettrainerbe.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class RoadmapDTO {
    private Integer id;
    private Integer userId;
    private String goal;
    private LocalDateTime createdAt;
    private List<RoadmapDayDTO> days;
}
