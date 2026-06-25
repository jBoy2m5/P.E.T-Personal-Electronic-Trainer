package org.example.pettrainerbe.model;

import jakarta.persistence.*;
import lombok.Data;

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
    private User user;

    private String appearanceType;
    private String emotionalState;
    private Integer totalExp;
    private Integer level;
    private LocalDateTime lastUpdated;
}