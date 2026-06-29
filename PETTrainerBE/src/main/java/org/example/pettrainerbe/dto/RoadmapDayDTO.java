package org.example.pettrainerbe.dto;

import lombok.Data;

@Data
public class RoadmapDayDTO {
    private Integer id;
    private Integer roadmapId;
    private Integer dayNumber;
    private String challengeName;
    private Integer duration;
    private Boolean isCompleted;
    private Integer kcal;
    private String muscleGroup;
}
