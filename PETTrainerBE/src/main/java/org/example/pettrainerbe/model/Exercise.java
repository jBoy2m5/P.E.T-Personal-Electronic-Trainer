package org.example.pettrainerbe.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties; // Nhớ import
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
    @JsonIgnoreProperties("exercises") // BÁO HỆ THỐNG: Khi load Nhóm cơ, đừng load lại danh sách bài tập của nó
    private MuscleGroup muscleGroup;

    private String name;
    private String technicalDescription;
    private String safetyNotes;
    private String mediaUrl;
    private String standardAngles;
    private Float estimatedCaloriesPerRep;
    private Integer reps;
    private Integer sets;
    private String level;
    private String videoUrl;
    private Boolean isJump;
    private String aiMode;

    @OneToMany(mappedBy = "exercise", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("exercise") // Chặn vòng lặp với WorkoutDetail
    private List<WorkoutDetail> workoutDetails;
}