package com.rms.dto.jobs;

import lombok.Data;

import java.util.List;

@Data
public class JobStatusDto {
    private String closeReason;
    private List<Long> selectedCandidateIds;
}
