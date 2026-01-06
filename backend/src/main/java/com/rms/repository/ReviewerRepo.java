package com.rms.repository;

import com.rms.entity.users.Reviewer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewerRepo extends JpaRepository<Reviewer,Long> {
    List<Reviewer> findByCompanyId(Long companyId);
}
