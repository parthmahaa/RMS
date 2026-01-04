package com.rms.dto.jobs;

import com.rms.constants.JobStatus;
import lombok.Data;

import java.util.List;

@Data
public class JobStatusDto {
    private String closeReason;
    private JobStatus status;
    private List<Long> selectedCandidateIds;
}
