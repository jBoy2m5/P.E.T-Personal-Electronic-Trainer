package org.example.pettrainerbe.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "pets")
@Data
public class Pet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer petId;

    @OneToOne
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"pet", "workoutSessions"})
    private User user;

    private String appearanceType;
    private String emotionalState;
    private Integer totalExp;
    private Integer level;
    private LocalDateTime lastUpdated;
    private Integer checkinStreak;
    private String lastCheckinDate;
}