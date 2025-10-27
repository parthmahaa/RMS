package com.rms.dto.user;

import com.rms.constants.RoleType;
import com.rms.dto.company.CompanyDto;
import lombok.Data;

import java.util.Set;

@Data
public class RecruiterProfileDto {

    private Long id;
    private String name;
    private String email;
    private Set<RoleType> role;
    private boolean profileCompleted;

    private CompanyDto company;
}
