package com.rms.dto.skills;

import com.rms.constants.SkillType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SkillReqDTO {

    @NotNull
    private Long skillId;

    private String skillName;

    private Integer yearsOfExperience;

    private SkillType level;

    private boolean mandatory;
}
