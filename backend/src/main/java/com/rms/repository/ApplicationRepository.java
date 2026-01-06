package com.rms.repository;

import com.rms.constants.ApplicationStatus;
import com.rms.entity.Applications;
import com.rms.entity.users.Candidate;
import com.rms.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Applications,Long> {
    Optional<Applications> findByJobIdAndCandidateId(Long jobId, Long candidateId);

    List<Applications> findByJobId(Long jobId);

    List<Applications> findByCandidateId(Long candidateId);

    boolean existsByJobAndCandidate(Job job, Candidate candidate);

    List<Applications> findByCandidateIdAndStatus(Long candidateId, ApplicationStatus status);
}
