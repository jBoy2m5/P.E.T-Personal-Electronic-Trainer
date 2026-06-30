package org.example.pettrainerbe.controller;

import org.example.pettrainerbe.dto.ErrorLogDTO;
import org.example.pettrainerbe.model.ErrorLog;
import org.example.pettrainerbe.repository.ErrorLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/error-logs")
public class ErrorLogController {

    @Autowired
    private ErrorLogRepository errorLogRepository;

    @GetMapping
    public List<ErrorLogDTO> getAllErrorLogs() {
        return errorLogRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ErrorLogDTO> getErrorLogById(@PathVariable Integer id) {
        return errorLogRepository.findById(id)
                .map(log -> ResponseEntity.ok(convertToDTO(log)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ErrorLogDTO> createErrorLog(@RequestBody ErrorLog errorLog) {
        ErrorLog savedLog = errorLogRepository.save(errorLog);
        return ResponseEntity.ok(convertToDTO(savedLog));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ErrorLogDTO> updateErrorLog(@PathVariable Integer id, @RequestBody ErrorLog logDetails) {
        return errorLogRepository.findById(id)
                .map(errorLog -> {
                    errorLog.setErrorDescription(logDetails.getErrorDescription());
                    errorLog.setKeypointsData(logDetails.getKeypointsData());
                    errorLog.setCreatedAt(logDetails.getCreatedAt());
                    if (logDetails.getWorkoutDetail() != null) {
                        errorLog.setWorkoutDetail(logDetails.getWorkoutDetail());
                    }
                    return ResponseEntity.ok(convertToDTO(errorLogRepository.save(errorLog)));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteErrorLog(@PathVariable Integer id) {
        if (errorLogRepository.existsById(id)) {
            errorLogRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // --- MAPPING ---
    private ErrorLogDTO convertToDTO(ErrorLog log) {
        ErrorLogDTO dto = new ErrorLogDTO();
        dto.setLogId(log.getLogId());
        dto.setErrorDescription(log.getErrorDescription());
        dto.setKeypointsData(log.getKeypointsData());
        dto.setCreatedAt(log.getCreatedAt());
        if (log.getWorkoutDetail() != null) {
            dto.setDetailId(log.getWorkoutDetail().getDetailId());
        }
        return dto;
    }
}