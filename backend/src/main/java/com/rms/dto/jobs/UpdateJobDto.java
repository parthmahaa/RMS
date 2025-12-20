package com.rms.dto.jobs;

import com.rms.dto.skills.SkillReqDTO;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UpdateJobDto {
    @Size(max = 255)
    private String position;

    @Size(max = 5000)
    private String description;

    private String location;
    private String type;
    private String status; // open, hold, closed

    @Size(max = 1000)
    private String closeComment;
    @Size(max = 500)
    private String closeReason;
    private List<@NotNull Long> selectedCandidateIds;

    private List<Long> requiredSkillIds;
    private List<Long> preferredSkillIds;

}
