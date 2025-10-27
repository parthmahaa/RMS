package com.rms.dto.user;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CandidateProfileUpdateDto {
    @NotBlank
    private String summary;

    @NotBlank
    private String phone;

    @NotBlank
    private String location;

    @NotNull
    private Integer totalExperience;

    @NotNull
    private Integer graduationYear;

    @NotBlank
    private String collegeName;

    @NotBlank
    private String degree;

    private String resumeFilePath;

    private String currentCompany;

    @Valid
    private List<UserSkillDto> skills;
}
