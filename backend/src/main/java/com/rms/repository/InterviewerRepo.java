package com.rms.repository;

import com.rms.entity.users.Interviewer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InterviewerRepo extends JpaRepository<Interviewer,Long> {
    List<Interviewer> findByCompanyId(Long companyId);
    Optional<Interviewer> findByUserId(Long id);
}
