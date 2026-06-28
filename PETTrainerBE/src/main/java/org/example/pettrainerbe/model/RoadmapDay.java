package org.example.pettrainerbe.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "roadmap_day")
@Data
public class RoadmapDay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "roadmap_id")
    @JsonIgnore
    private Roadmap roadmap;

    @Column(name = "day_number")
    private Integer dayNumber;

    @Column(name = "muscle_group")
    private String muscleGroup;

    @Column(name = "challenge_name")
    private String challengeName;

    private Integer duration;

    @Column(name = "is_completed")
    private Boolean isCompleted = false;
    
    // Additional fields mapped from JSON if needed, e.g., kcal
    private Integer kcal;
}
