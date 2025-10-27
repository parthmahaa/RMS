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
    private LocalDateTime appliedAt;
    private String recruiterComment;
    private String status;
}
