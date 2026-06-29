package org.example.pettrainerbe.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "roadmap_day")
@Data
public class RoadmapDay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "roadmap_id")
    @JsonIgnoreProperties("days")
    private Roadmap roadmap;

    private Integer dayNumber;
    private String challengeName;
    private Integer duration;
    private Boolean isCompleted;
    private Integer kcal;
    private String muscleGroup;
}
