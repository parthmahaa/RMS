package com.rms.dto.interviews;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class InterviewDto {

    private Long id;
    private Long applicationId;
    private Long jobId;
    private String position;
    private String companyName;
    private String candidateName;
    private Long candidateExperience;
    private String status;
    private String resumeFilePath;
    private List<InterviewRoundDto> rounds;
    private String aadharUrl;
    private LocalDate joiningDate;
    private Boolean isDocumentsVerified;
    private String marksheetUrl;
    private String addressProofUrl;
    private String finalComments;
}
