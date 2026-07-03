package org.example.pettrainerbe.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "roadmaps")
@Data
public class Roadmap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"pet", "workoutSessions"})
    private User user;

    private String goal;
    private LocalDateTime createdAt;

    /**
     * Tài liệu lộ trình 28 ngày dạng JSON (nguồn sự thật duy nhất, thay localStorage):
     * mảng 28 ngày gồm bài tập, cờ ngày nghỉ, field song ngữ, status/completedDate
     * và tick từng bài (completedExercises) theo dayId. Backend không parse —
     * chỉ lưu hộ frontend.
     */
    @Column(columnDefinition = "LONGTEXT")
    private String roadmapJson;

    // Cache lời khuyên AI theo ngôn ngữ (trước đây cache ở localStorage)
    @Column(columnDefinition = "TEXT")
    private String adviceVi;

    @Column(columnDefinition = "TEXT")
    private String adviceEn;

    @OneToMany(mappedBy = "roadmap", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("roadmap")
    private List<RoadmapDay> days;
}
