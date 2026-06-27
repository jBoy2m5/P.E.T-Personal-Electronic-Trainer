package org.example.pettrainerbe.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties; // Nhớ import cái này
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
    @JsonIgnoreProperties("muscleGroup") // BÁO HỆ THỐNG: Khi load danh sách bài tập, bỏ qua trường "muscleGroup" bên trong nó đi
    private List<Exercise> exercises;
}