package com.rms.dto.skills;

import com.rms.constants.ProposalStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProposedSkillDto {
    private Long id;
    private String name;
    private Long proposedById;
    private String companyName;
    private ProposalStatus status;
    private String rejectionReason;
    private LocalDateTime proposedAt;

}
