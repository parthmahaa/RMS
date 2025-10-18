package com.rms.dto;

import com.rms.constants.RoleType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SignupRequestDTO {
    private String name;
    private String email;
    private String password;
    private String phone;
    private String roles;
}
