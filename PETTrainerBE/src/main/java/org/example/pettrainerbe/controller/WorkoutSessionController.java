package org.example.pettrainerbe.controller;

import org.example.pettrainerbe.model.WorkoutSession;
import org.example.pettrainerbe.repository.WorkoutSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workout-sessions")
public class WorkoutSessionController {

    @Autowired
    private WorkoutSessionRepository workoutSessionRepository;

    @GetMapping
    public List<WorkoutSession> getAllSessions() {
        return workoutSessionRepository.findAll();
    }

    @PostMapping
    public WorkoutSession createSession(@RequestBody WorkoutSession session) {
        return workoutSessionRepository.save(session);
    }
}