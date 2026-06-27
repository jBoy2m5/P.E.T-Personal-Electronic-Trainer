package org.example.pettrainerbe.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthDTO {
    private String status;
    private String message;
    private String token; // Có thể để null cho Register
    private Integer userId; // Có thể để null cho Register
}