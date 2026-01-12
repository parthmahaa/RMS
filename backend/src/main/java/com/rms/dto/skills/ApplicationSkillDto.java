package com.rms.dto.skills;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApplicationSkillDto {

    private Long id;
    private Long skillId;
    private String skillName;
    private Integer yearsOfExperience;
}
