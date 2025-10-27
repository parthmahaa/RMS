package com.rms.dto.skills;

import com.rms.constants.ProposalStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProposedSkillUpdateDto {

    private ProposalStatus status;
    private String rejectionReason;
}
