package org.example.pettrainerbe.controller;

import org.example.pettrainerbe.model.WorkoutDetail;
import org.example.pettrainerbe.repository.WorkoutDetailRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workout-details")
public class WorkoutDetailController {

    @Autowired
    private WorkoutDetailRepository workoutDetailRepository;

    @GetMapping
    public List<WorkoutDetail> getAllDetails() {
        return workoutDetailRepository.findAll();
    }

    @PostMapping
    public WorkoutDetail createDetail(@RequestBody WorkoutDetail detail) {
        return workoutDetailRepository.save(detail);
    }
}