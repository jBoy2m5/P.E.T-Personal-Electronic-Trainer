package org.example.pettrainerbe.repository;

import org.example.pettrainerbe.model.Roadmap;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoadmapRepository extends JpaRepository<Roadmap, Integer> {
    List<Roadmap> findByUserUserId(Integer userId);
    Optional<Roadmap> findFirstByUserUserIdOrderByIdDesc(Integer userId);
}
