package com.rms.dto.interviews;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class HrVerificationDto {
    private LocalDate joiningDate;
    private String remarks;
    private Boolean isApproved;
}
