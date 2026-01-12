package com.rms.dto.jobs;

import com.rms.dto.skills.SkillReqDTO;
import com.rms.entity.UserEntity;
import com.rms.entity.users.Reviewer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

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
    private Long yoer;
    private Set<UserEntity> reviewers;
    private String closeComment;
    private String closeReason;
    private List<Long> selectedCandidateIds;
    private String companyName;
    private Long createdById;
    private List<SkillReqDTO> requiredSkills;
    private List<SkillReqDTO> preferredSkills;
    private List<JobApplicationDto> applications;
}
