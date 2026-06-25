package org.example.pettrainerbe.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Table(name = "workout_details")
@Data
public class WorkoutDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer detailId;

    @ManyToOne
    @JoinColumn(name = "session_id")
    private WorkoutSession workoutSession;

    @ManyToOne
    @JoinColumn(name = "exercise_id")
    private Exercise exercise;

    private Integer repsCompleted;

    @OneToMany(mappedBy = "workoutDetail", cascade = CascadeType.ALL)
    private List<ErrorLog> errorLogs;
}