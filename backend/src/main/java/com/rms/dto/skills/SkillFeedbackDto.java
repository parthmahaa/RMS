package com.rms.dto.skills;

import lombok.Data;

@Data
public class SkillFeedbackDto {
    private Long skillId;
    private String skillName;
    private Integer rating;
    private String comments;
}
