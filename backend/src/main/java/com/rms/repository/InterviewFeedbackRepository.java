package com.rms.repository;

import com.rms.entity.interviews.InterviewFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InterviewFeedbackRepository extends JpaRepository<InterviewFeedback,Long> {
    Optional<InterviewFeedback> findByRoundIdAndSkillIdAndInterviewerId(Long roundId, Long skillId, Long interviewerId);
}
