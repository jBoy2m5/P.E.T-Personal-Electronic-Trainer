package org.example.pettrainerbe.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PetDTO {
    private Integer petId;
    private String appearanceType;
    private String emotionalState;
    private Integer totalExp;
    private Integer level;
    private LocalDateTime lastUpdated;
    private Integer userId;
    private Integer checkinStreak;
    private String lastCheckinDate;
}