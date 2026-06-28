package org.example.pettrainerbe.repository;

import org.example.pettrainerbe.model.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExerciseRepository extends JpaRepository<Exercise, Integer> {
}