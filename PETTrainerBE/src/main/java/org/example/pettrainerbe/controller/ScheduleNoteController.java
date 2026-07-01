package org.example.pettrainerbe.controller;

import org.example.pettrainerbe.model.ScheduleNote;
import org.example.pettrainerbe.model.User;
import org.example.pettrainerbe.repository.ScheduleNoteRepository;
import org.example.pettrainerbe.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/schedule-notes")
public class ScheduleNoteController {

    @Autowired
    private ScheduleNoteRepository scheduleNoteRepository;

    @Autowired
    private UserRepository userRepository;

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email);
    }

    @GetMapping("/me")
    public ResponseEntity<List<ScheduleNote>> getMyNotes() {
        User user = currentUser();
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(scheduleNoteRepository.findByUserId(user.getUserId()));
    }

    @PutMapping
    public ResponseEntity<?> upsertNote(@RequestBody Map<String, Object> body) {
        User user = currentUser();
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        String dateKey = (String) body.get("date_key");
        String note = (String) body.get("note");
        if (dateKey == null) return ResponseEntity.badRequest().build();

        ScheduleNote existing = scheduleNoteRepository.findByUserIdAndDateKey(user.getUserId(), dateKey);
        if (note == null || note.trim().isEmpty()) {
            if (existing != null) scheduleNoteRepository.delete(existing);
            return ResponseEntity.ok().build();
        }

        if (existing == null) {
            existing = new ScheduleNote();
            existing.setUserId(user.getUserId());
            existing.setDateKey(dateKey);
        }
        existing.setNote(note.trim());
        return ResponseEntity.ok(scheduleNoteRepository.save(existing));
    }
}
