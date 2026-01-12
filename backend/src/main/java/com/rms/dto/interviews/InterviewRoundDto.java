package com.rms.dto.interviews;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.rms.dto.skills.SkillFeedbackDto;
import com.rms.dto.user.EmployeeDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InterviewRoundDto {
    private Long id;
    private Integer roundNumber;
    private String roundType;
    private String status;
    private LocalDateTime scheduledAt;
    private String meetingLink;
    private String comments;

    private List<EmployeeDTO> assignedInterviewers;
    private List<EmployeeDTO> assignedHrs;
    private List<SkillFeedbackDto> feedbacks;
}
