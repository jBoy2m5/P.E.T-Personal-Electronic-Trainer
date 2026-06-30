package org.example.pettrainerbe.controller;

import org.example.pettrainerbe.dto.PetDTO;
import org.example.pettrainerbe.model.Pet;
import org.example.pettrainerbe.model.User;
import org.example.pettrainerbe.repository.PetRepository;
import org.example.pettrainerbe.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/pets")
public class PetController {

    @Autowired
    private PetRepository petRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<PetDTO> getAllPets() {
        return petRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PetDTO> getPetById(@PathVariable Integer id) {
        return petRepository.findById(id)
                .map(pet -> ResponseEntity.ok(convertToDTO(pet)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<PetDTO> getPetByUserId(@PathVariable Integer userId) {
        return petRepository.findAll().stream()
                .filter(p -> p.getUser() != null && p.getUser().getUserId().equals(userId))
                .findFirst()
                .map(pet -> ResponseEntity.ok(convertToDTO(pet)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PetDTO> createPet(@RequestBody java.util.Map<String, Object> body) {
        Integer userId = (Integer) body.get("user_id");
        if (userId == null) return ResponseEntity.badRequest().build();

        // Return existing pet if already created
        java.util.Optional<Pet> existing = petRepository.findAll().stream()
                .filter(p -> p.getUser() != null && p.getUser().getUserId().equals(userId))
                .findFirst();
        if (existing.isPresent()) return ResponseEntity.ok(convertToDTO(existing.get()));

        return userRepository.findById(userId).map(user -> {
            Pet pet = new Pet();
            pet.setUser(user);
            pet.setLevel(body.get("level") != null ? (Integer) body.get("level") : 1);
            pet.setTotalExp(body.get("total_exp") != null ? (Integer) body.get("total_exp") : 0);
            return ResponseEntity.ok(convertToDTO(petRepository.save(pet)));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<PetDTO> updatePet(@PathVariable Integer id, @RequestBody Pet petDetails) {
        return petRepository.findById(id)
                .map(pet -> {
                    pet.setAppearanceType(petDetails.getAppearanceType());
                    pet.setEmotionalState(petDetails.getEmotionalState());
                    pet.setTotalExp(petDetails.getTotalExp());
                    pet.setLevel(petDetails.getLevel());
                    pet.setLastUpdated(petDetails.getLastUpdated());
                    if (petDetails.getUser() != null) {
                        pet.setUser(petDetails.getUser());
                    }
                    return ResponseEntity.ok(convertToDTO(petRepository.save(pet)));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/checkin")
    public ResponseEntity<PetDTO> checkin(@PathVariable Integer id) {
        return petRepository.findById(id).map(pet -> {
            LocalDate today = LocalDate.now();
            LocalDate last = pet.getLastCheckinDate();

            if (last != null && last.equals(today)) {
                // Already checked in today
                return ResponseEntity.ok(convertToDTO(pet));
            }

            int currentStreak = pet.getCheckinStreak() == null ? 0 : pet.getCheckinStreak();
            int newStreak = (last != null && last.equals(today.minusDays(1)))
                    ? currentStreak + 1
                    : 1;

            int dayInCycle = ((newStreak - 1) % 7) + 1;
            int[] expRewards = {10, 15, 20, 25, 30, 40, 100};
            int expGained = expRewards[dayInCycle - 1];

            int newTotalExp = (pet.getTotalExp() == null ? 0 : pet.getTotalExp()) + expGained;
            int newLevel = calcLevel(newTotalExp);

            pet.setCheckinStreak(newStreak);
            pet.setLastCheckinDate(today);
            pet.setTotalExp(newTotalExp);
            pet.setLevel(newLevel);
            petRepository.save(pet);

            PetDTO dto = convertToDTO(pet);
            dto.setCheckinExpGained(expGained);
            return ResponseEntity.ok(dto);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePet(@PathVariable Integer id) {
        if (petRepository.existsById(id)) {
            petRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // --- MAPPING ---
    private PetDTO convertToDTO(Pet pet) {
        PetDTO dto = new PetDTO();
        dto.setPetId(pet.getPetId());
        dto.setAppearanceType(pet.getAppearanceType());
        dto.setEmotionalState(pet.getEmotionalState());
        dto.setTotalExp(pet.getTotalExp());
        dto.setLevel(pet.getLevel());
        dto.setLastUpdated(pet.getLastUpdated());
        dto.setCheckinStreak(pet.getCheckinStreak() == null ? 0 : pet.getCheckinStreak());
        dto.setLastCheckinDate(pet.getLastCheckinDate());
        if (pet.getUser() != null) {
            dto.setUserId(pet.getUser().getUserId());
        }
        return dto;
    }

    private int calcLevel(int exp) {
        if (exp >= 2500) return 8;
        if (exp >= 1200) return 7;
        if (exp >= 600) return 6;
        if (exp >= 300) return 5;
        if (exp >= 150) return 4;
        if (exp >= 50) return 3;
        if (exp >= 10) return 2;
        return 1;
    }
}