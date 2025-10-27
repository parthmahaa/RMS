package com.rms.repository;

import com.rms.entity.UserSkills;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserSkillsRepository extends JpaRepository<UserSkills,Long> {
    List<UserSkills> findByUserId(Long userId);

    @Modifying
    @Query("DELETE FROM UserSkills us WHERE us.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);

}