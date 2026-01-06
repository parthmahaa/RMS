package com.rms.dto.user;

import com.rms.constants.RoleType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateCompanyUserDTO {

    private String name;

    @Email(message = "Invalid email")
    private String email;

    @NotNull(message = "Role is required")
    private RoleType role;
}
