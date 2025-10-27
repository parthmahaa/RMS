package com.rms.dto.user;

import com.rms.constants.SkillType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserSkillDto {
    private Long id;
    private Long skillId;
    private String name;
}
