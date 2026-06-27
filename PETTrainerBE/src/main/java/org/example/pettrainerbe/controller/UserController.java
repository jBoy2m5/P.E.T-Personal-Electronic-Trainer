package org.example.pettrainerbe.controller;

import org.example.pettrainerbe.dto.PetDTO;
import org.example.pettrainerbe.dto.UserDTO;
import org.example.pettrainerbe.model.User;
import org.example.pettrainerbe.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Integer id) {
        return userRepository.findById(id)
                .map(user -> ResponseEntity.ok(convertToDTO(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<UserDTO> createUser(@RequestBody User user) {
        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(convertToDTO(savedUser));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Integer id, @RequestBody User userDetails) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setEmail(userDetails.getEmail());
                    user.setFitnessGoal(userDetails.getFitnessGoal());
                    user.setWeight(userDetails.getWeight());
                    user.setHeight(userDetails.getHeight());
                    user.setBmi(userDetails.getBmi());
                    return ResponseEntity.ok(convertToDTO(userRepository.save(user)));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // --- MAPPING ---
    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setUserId(user.getUserId());
        dto.setEmail(user.getEmail());
        dto.setHeight(user.getHeight());
        dto.setWeight(user.getWeight());
        dto.setBmi(user.getBmi());
        dto.setFitnessGoal(user.getFitnessGoal());
        dto.setGoogleOauthId(user.getGoogleOauthId());

        if (user.getPet() != null) {
            PetDTO petDto = new PetDTO();
            petDto.setPetId(user.getPet().getPetId());
            petDto.setAppearanceType(user.getPet().getAppearanceType());
            petDto.setEmotionalState(user.getPet().getEmotionalState());
            petDto.setTotalExp(user.getPet().getTotalExp());
            petDto.setLevel(user.getPet().getLevel());
            petDto.setLastUpdated(user.getPet().getLastUpdated());
            petDto.setUserId(user.getUserId());
            dto.setPet(petDto);
        }
        return dto;
    }
}