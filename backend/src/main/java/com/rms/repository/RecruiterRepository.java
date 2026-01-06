package com.rms.repository;

import com.rms.entity.users.Recruiter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecruiterRepository extends JpaRepository<Recruiter,Long> {
    Optional<Recruiter> findByUserId(Long userId);
    List<Recruiter> findByCompanyId(Long companyId);
}
