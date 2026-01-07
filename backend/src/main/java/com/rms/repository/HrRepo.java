package com.rms.repository;

import com.rms.entity.users.HR;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HrRepo extends JpaRepository<HR,Long> {
    List<HR> findByCompanyId(Long companyId);
    Optional<HR> findByUserId(Long id);
}
