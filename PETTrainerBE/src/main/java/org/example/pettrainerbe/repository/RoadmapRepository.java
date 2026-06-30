package org.example.pettrainerbe.repository;

import org.example.pettrainerbe.model.Roadmap;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoadmapRepository extends JpaRepository<Roadmap, Integer> {
    List<Roadmap> findByUserUserId(Integer userId);
}
