package com.rms.dto.auth;

import lombok.Data;

@Data
public class SetPasswordDTO {
    private  String email;
    private String otp;
    private String password;
}
