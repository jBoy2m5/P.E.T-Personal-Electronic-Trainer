package org.example.pettrainerbe.repository;

import org.example.pettrainerbe.model.RoadmapDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoadmapDayRepository extends JpaRepository<RoadmapDay, Integer> {
    List<RoadmapDay> findByRoadmapIdOrderByDayNumberAsc(Integer roadmapId);
}
