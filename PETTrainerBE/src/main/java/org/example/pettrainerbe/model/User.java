package org.example.pettrainerbe.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer userId;

    private String email;
    private String name;

    @Column(columnDefinition = "LONGTEXT")
    private String pictureUrl;
    private String passwordHash;
    private Float height;
    private Float weight;
    private Float bmi;
    private String fitnessGoal;
    private String googleOauthId;
    
    // Onboarding additional fields
    private String gender;
    private String fitnessLevel;
    private Integer sessionsPerWeek;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("user")
    private Pet pet;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("user")
    private List<WorkoutSession> workoutSessions;
}