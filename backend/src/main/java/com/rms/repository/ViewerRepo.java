package com.rms.repository;

import com.rms.entity.users.Viewer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ViewerRepo extends JpaRepository<Viewer,Long> {
    List<Viewer> findByCompanyId(Long companyId);
    Optional<Viewer> findByUserId(Long id);
}
