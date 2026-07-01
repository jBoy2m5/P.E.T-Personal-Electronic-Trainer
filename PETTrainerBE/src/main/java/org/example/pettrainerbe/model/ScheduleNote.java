package org.example.pettrainerbe.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "schedule_notes")
@Data
public class ScheduleNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer noteId;

    private Integer userId;
    private String dateKey; // "YYYY-MM-DD"

    @Column(columnDefinition = "TEXT")
    private String note;
}
