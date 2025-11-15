package com.rms.dto.jobs;

import com.rms.dto.skills.SkillReqDTO;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateJobDto {

    @NotBlank(message = "Position is required")
    @Size(max = 255)
    private String position;

    @NotBlank(message = "Description is required")
    @Size(max = 5000)
    private String description;

    @NotBlank(message = "Location is required")
    private String location;

    @NotBlank(message = "Type is required")
    private String type; // e.g., "FULL_TIME", "INTERN"

    private Long companyId;

    private List<SkillReqDTO> skillRequirementIds;
}
