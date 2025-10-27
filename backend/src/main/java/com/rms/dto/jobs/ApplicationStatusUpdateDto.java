package com.rms.dto.jobs;

import com.rms.constants.ApplicationStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ApplicationStatusUpdateDto {

    @NotBlank
    private ApplicationStatus status;
    private String remarks;
}
