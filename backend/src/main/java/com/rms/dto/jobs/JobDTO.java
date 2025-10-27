package com.rms.dto.jobs;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class JobDTO {
    private Long id;
    private String position;
    private String description;
    private String location;
    private String type;
    private String status;
    private LocalDateTime postedAt;
    private String closeComment;
    private String closeReason;
    private List<Long> selectedCandidateIds;
    private String companyName;
    private Long createdById;
    private List<Long> skillRequirementIds;
    private List<JobApplicationDto> applications;
}
