package com.rms.dto.interviews;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InterviewDocumentsDto {

    private Long interviewId;
    private String aadharUrl;
    private String marksheetUrl;
    private String addressProofUrl;
}
