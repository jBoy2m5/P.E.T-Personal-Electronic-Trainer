package org.example.pettrainerbe.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Table(name = "exercises")
@Data
public class Exercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer exerciseId;

    @ManyToOne
    @JoinColumn(name = "group_id")
    private MuscleGroup muscleGroup;

    private String name;
    private String technicalDescription;
    private String safetyNotes;
    private String mediaUrl;
    private String standardAngles;
    private Float estimatedCaloriesPerRep;

    @OneToMany(mappedBy = "exercise", cascade = CascadeType.ALL)
    private List<WorkoutDetail> workoutDetails;
}