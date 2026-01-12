package com.rms.repository;

import com.rms.entity.interviews.Interview;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewRepository extends JpaRepository<Interview,Long> {
    List<Interview> findByCompanyId(Long companyId);
    List<Interview> findByCandidateId(Long candidateId);
    List<Interview> findAllByInterviewersId(Long userId);

    Optional<Interview> findByApplicationId(Long id);
}
