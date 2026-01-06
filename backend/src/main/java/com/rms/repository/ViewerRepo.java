package com.rms.repository;

import com.rms.entity.users.HR;
import com.rms.entity.users.Viewer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ViewerRepo extends JpaRepository<Viewer,Long> {
    List<Viewer> findByCompanyId(Long companyId);
}
