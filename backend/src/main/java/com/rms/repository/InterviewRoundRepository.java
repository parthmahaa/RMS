package com.rms.repository;

import com.rms.entity.interviews.InterviewRound;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InterviewRoundRepository extends JpaRepository<InterviewRound,Long> {
}
