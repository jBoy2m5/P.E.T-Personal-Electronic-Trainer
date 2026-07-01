package org.example.pettrainerbe.repository;

import org.example.pettrainerbe.model.WorkoutSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface WorkoutSessionRepository extends JpaRepository<WorkoutSession, Integer> {
    List<WorkoutSession> findByUser_UserIdAndStartTimeBetween(Integer userId, LocalDateTime start, LocalDateTime end);
}