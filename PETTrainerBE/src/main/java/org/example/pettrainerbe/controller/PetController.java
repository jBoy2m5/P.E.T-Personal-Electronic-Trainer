package org.example.pettrainerbe.controller;

import org.example.pettrainerbe.dto.PetDTO;
import org.example.pettrainerbe.model.Pet;
import org.example.pettrainerbe.repository.PetRepository;
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
    public ResponseEntity<PetDTO> createPet(@RequestBody Pet pet) {
        Pet savedPet = petRepository.save(pet);
        return ResponseEntity.ok(convertToDTO(savedPet));
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
        if (pet.getUser() != null) {
            dto.setUserId(pet.getUser().getUserId());
        }
        return dto;
    }
}