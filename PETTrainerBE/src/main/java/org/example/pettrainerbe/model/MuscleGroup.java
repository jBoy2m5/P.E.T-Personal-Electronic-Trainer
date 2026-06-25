package org.example.pettrainerbe.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Table(name = "muscle_groups")
@Data
public class MuscleGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer groupId;

    private String name;
    private String description;

    @OneToMany(mappedBy = "muscleGroup", cascade = CascadeType.ALL)
    private List<Exercise> exercises;
}