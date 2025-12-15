package com.rms.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateProfileDto {
    private Long id;
    private String name;
    private String email;
    private boolean profileCompleted;
    private String summary;
    private String phone;
    private String location;
    private String role="CANDIDATE";
    private Integer totalExperience;
    private String branch;
    private Integer graduationYear;
    private String collegeName;
    private String degree;
    private String resumeFilePath;
    private String currentCompany;

    private List<UserSkillDto> skills;

}
