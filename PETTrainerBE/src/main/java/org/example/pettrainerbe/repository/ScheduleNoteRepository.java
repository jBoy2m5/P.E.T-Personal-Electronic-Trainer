package org.example.pettrainerbe.repository;

import org.example.pettrainerbe.model.ScheduleNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScheduleNoteRepository extends JpaRepository<ScheduleNote, Integer> {
    List<ScheduleNote> findByUserId(Integer userId);
    ScheduleNote findByUserIdAndDateKey(Integer userId, String dateKey);
}
