package com.zzaptalk.backend.dto;

import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSignUpRequest {

    @NotBlank private String phoneNum;
    @Email @NotBlank private String email;
    @NotBlank private String pwd;
    @NotBlank private String name;
    @NotBlank private String nickname;
    @NotBlank private String RRN;
    private String zzapID;

}