package com.rms.repository;

import com.rms.entity.JobSkillRequirement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JobSkillReqRepository extends JpaRepository<JobSkillRequirement,Long> {
}
