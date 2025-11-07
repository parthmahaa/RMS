package com.rms.dto.jobs;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class JobApplicationDto {
    private Long id;
    private Long jobId;
    private Long candidateId;
    private String coverLetter;
    private String resumeFilePath;
    private LocalDateTime appliedAt;
    private String recruiterComment;
    private String status;

    private String position;
    private String companyName;
    private String location;
    private String type;
}
