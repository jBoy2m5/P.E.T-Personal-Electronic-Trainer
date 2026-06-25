package org.example.pettrainerbe.repository;

import org.example.pettrainerbe.model.WorkoutDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WorkoutDetailRepository extends JpaRepository<WorkoutDetail, Integer> {
}