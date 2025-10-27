package com.rms.dto.auth;

import lombok.Data;

@Data
public class LoginRequestDTO {

    private String password;
    private String email;

}
