package org.example.pettrainerbe.controller;

import org.example.pettrainerbe.dto.PetDTO;
import org.example.pettrainerbe.model.Pet;
import org.example.pettrainerbe.model.User;
import org.example.pettrainerbe.repository.PetRepository;
import org.example.pettrainerbe.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
        return petRepository.findByUser_UserId(userId)
                .map(pet -> ResponseEntity.ok(convertToDTO(pet)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PetDTO> createPet(@RequestBody java.util.Map<String, Object> body) {
        Integer userId = (Integer) body.get("user_id");
        if (userId == null) return ResponseEntity.badRequest().build();

        // Return existing pet if already created
        java.util.Optional<Pet> existing = petRepository.findByUser_UserId(userId);
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
    public ResponseEntity<PetDTO> updatePet(@PathVariable Integer id, @RequestBody java.util.Map<String, Object> body) {
        return petRepository.findById(id)
                .map(pet -> {
                    if (body.containsKey("total_exp")) pet.setTotalExp((Integer) body.get("total_exp"));
                    if (body.containsKey("level")) pet.setLevel((Integer) body.get("level"));
                    if (body.containsKey("pet_name")) {
                        String petName = (String) body.get("pet_name");
                        if (petName != null) {
                            petName = petName.trim();
                            if (petName.length() > 20) petName = petName.substring(0, 20);
                            pet.setPetName(petName);
                        }
                    }
                    if (body.containsKey("appearance_type")) pet.setAppearanceType((String) body.get("appearance_type"));
                    if (body.containsKey("emotional_state")) pet.setEmotionalState((String) body.get("emotional_state"));
                    if (body.containsKey("checkin_streak")) pet.setCheckinStreak((Integer) body.get("checkin_streak"));
                    if (body.containsKey("last_checkin_date")) {
                        String dateStr = (String) body.get("last_checkin_date");
                        pet.setLastCheckinDate(dateStr != null ? java.time.LocalDate.parse(dateStr) : null);
                    }
                    if (body.containsKey("pet_daily_date")) pet.setPetDailyDate((String) body.get("pet_daily_date"));
                    if (body.containsKey("points_earned_today")) pet.setPointsEarnedToday((Integer) body.get("points_earned_today"));
                    if (body.containsKey("exercises_trained")) pet.setExercisesTrained((String) body.get("exercises_trained"));
                    if (body.containsKey("claimed_missions")) pet.setClaimedMissions((String) body.get("claimed_missions"));
                    return ResponseEntity.ok(convertToDTO(petRepository.save(pet)));
                })
                .orElse(ResponseEntity.notFound().build());
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
        dto.setPetName(pet.getPetName());
        dto.setAppearanceType(pet.getAppearanceType());
        dto.setEmotionalState(pet.getEmotionalState());
        dto.setTotalExp(pet.getTotalExp());
        dto.setLevel(pet.getLevel());
        dto.setLastUpdated(pet.getLastUpdated());
        dto.setCheckinStreak(pet.getCheckinStreak() == null ? 0 : pet.getCheckinStreak());
        dto.setLastCheckinDate(pet.getLastCheckinDate() != null ? pet.getLastCheckinDate().toString() : null);
        dto.setPetDailyDate(pet.getPetDailyDate());
        dto.setPointsEarnedToday(pet.getPointsEarnedToday() == null ? 0 : pet.getPointsEarnedToday());
        dto.setExercisesTrained(pet.getExercisesTrained());
        dto.setClaimedMissions(pet.getClaimedMissions());
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