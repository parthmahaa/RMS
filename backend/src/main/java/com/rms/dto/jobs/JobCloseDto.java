package com.rms.dto.jobs;

import lombok.Data;

import java.util.List;

@Data
public class JobCloseDto {
    private String closeReason;
    private List<Long> selectedCandidateIds;
}
