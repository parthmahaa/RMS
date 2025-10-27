package com.rms.repository;

import com.rms.constants.ProposalStatus;
import com.rms.entity.ProposedSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProposedSkillRepository extends JpaRepository<ProposedSkill,Long> {
    List<ProposedSkill> findByStatus(ProposalStatus status);
    List<ProposedSkill> findByProposedByIdAndStatus(Long proposedById, ProposalStatus status);
}
