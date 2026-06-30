package org.example.pettrainerbe.repository;

import org.example.pettrainerbe.model.RoadmapDay;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoadmapDayRepository extends JpaRepository<RoadmapDay, Integer> {
    List<RoadmapDay> findByRoadmapId(Integer roadmapId);
}
