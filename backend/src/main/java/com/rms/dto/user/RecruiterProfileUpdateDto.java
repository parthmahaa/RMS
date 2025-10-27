package com.rms.dto.user;

import com.rms.dto.company.CompanyUpdateDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RecruiterProfileUpdateDto {

    @NotNull
    @Valid
    private CompanyUpdateDto company;
}
