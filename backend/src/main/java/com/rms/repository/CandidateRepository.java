package com.rms.repository;


import com.rms.entity.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate,Long> {
    Optional<Candidate> findByUserId(Long userId);
}
