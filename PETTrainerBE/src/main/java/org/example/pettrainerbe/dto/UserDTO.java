package org.example.pettrainerbe.dto;

import lombok.Data;

@Data
public class UserDTO {
    private Integer userId;
    private String email;
    private Float height;
    private Float weight;
    private Float bmi;
    private String fitnessGoal;
    private String googleOauthId;
    private PetDTO pet; // Trả về luôn thông tin Pet
}