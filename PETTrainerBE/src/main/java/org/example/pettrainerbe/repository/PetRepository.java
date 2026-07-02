package org.example.pettrainerbe.repository;

import org.example.pettrainerbe.model.Pet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PetRepository extends JpaRepository<Pet, Integer> {
    Optional<Pet> findByUser_UserId(Integer userId);
}