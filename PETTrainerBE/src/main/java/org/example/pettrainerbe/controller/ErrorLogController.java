package org.example.pettrainerbe.controller;

import org.example.pettrainerbe.model.ErrorLog;
import org.example.pettrainerbe.repository.ErrorLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/error-logs")
public class ErrorLogController {

    @Autowired
    private ErrorLogRepository errorLogRepository;

    @GetMapping
    public List<ErrorLog> getAllErrorLogs() {
        return errorLogRepository.findAll();
    }

    @PostMapping
    public ErrorLog createErrorLog(@RequestBody ErrorLog errorLog) {
        return errorLogRepository.save(errorLog);
    }
}