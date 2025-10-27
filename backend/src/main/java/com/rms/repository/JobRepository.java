package com.rms.repository;

import com.rms.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    List<Job> findByStatus(String status);

    @Query("SELECT j FROM Job j WHERE j.status = 'OPEN' AND j.company.id = :companyId")
    List<Job> findOpenJobsByCompany(@Param("companyId") Long companyId);

    @Query("SELECT j FROM Job j WHERE j.status = 'OPEN'")
    List<Job> findAllOpenJobs();
}
