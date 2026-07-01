package org.example.pettrainerbe.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "pets")
@Data
public class Pet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer petId;

    @OneToOne
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"pet", "workoutSessions"})
    private User user;

    private String appearanceType;
    private String emotionalState;
    private Integer totalExp;
    private Integer level;
    private LocalDateTime lastUpdated;
    private Integer checkinStreak;
    private LocalDate lastCheckinDate;

    // Trạng thái nhiệm vụ hằng ngày (đồng bộ giữa các trình duyệt)
    private String petDailyDate;          // Ngày áp dụng "YYYY-MM-DD"
    private Integer pointsEarnedToday;    // EXP đã nhận trong ngày (giới hạn 300)

    @Column(columnDefinition = "TEXT")
    private String exercisesTrained;      // JSON mảng tên bài đã tập hôm nay

    @Column(columnDefinition = "TEXT")
    private String claimedMissions;       // JSON mảng id nhiệm vụ đã nhận hôm nay
}