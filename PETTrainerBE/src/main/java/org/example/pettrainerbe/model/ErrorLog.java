package org.example.pettrainerbe.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "error_logs")
@Data
public class ErrorLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer logId;

    @ManyToOne
    @JoinColumn(name = "detail_id")
    private WorkoutDetail workoutDetail;

    private String errorDescription;
    private String keypointsData;
    private LocalDateTime createdAt;
}