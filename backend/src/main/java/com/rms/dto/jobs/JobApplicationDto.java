package com.rms.dto.jobs;

import com.rms.entity.Skill;
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
public class JobApplicationDto {
    private Long id;
    private Long jobId;
    private Long candidateId;
    private String candidateName;
    private String coverLetter;
    private String resumeFilePath;
    private LocalDateTime appliedAt;
    private List<Skill> candidateSkills;
    private String recruiterComment;
    private String status;
    private Long candidateExperience;  // YOE a candidate has
    private String position;
    private String companyName;
    private String location;
    private String type;
}
