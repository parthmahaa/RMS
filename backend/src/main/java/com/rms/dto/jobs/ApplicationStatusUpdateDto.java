package com.rms.dto.jobs;

import com.rms.constants.ApplicationStatus;
import com.rms.dto.skills.ApplicationSkillDto;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class ApplicationStatusUpdateDto {

    @NotNull
    private ApplicationStatus status;
    private String remarks;
    private List<ApplicationSkillDto> skillsWithYoe;
    private Integer numberOfRounds;

}
