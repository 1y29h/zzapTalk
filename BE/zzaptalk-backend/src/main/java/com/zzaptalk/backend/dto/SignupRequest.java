package com.zzaptalk.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class SignupRequest {
    
    @NotBlank(message = "이름은 필수입니다.")
    private String name;
    
    @NotBlank(message = "전화번호는 필수입니다.")
    @Pattern(regexp = "^01[0-9]-?\\d{3,4}-?\\d{4}$", message = "전화번호 형식이 올바르지 않습니다. (예: 01012345678 또는 010-1234-5678)")
    private String phoneNumber; // 하이픈 자동 추가됨
    
    @NotBlank(message = "주민번호는 필수입니다.")
    @Pattern(regexp = "^\\d{6}[1-4]$", message = "주민번호 형식이 올바르지 않습니다. (예: 9901011)")
    private String residentNumber; // 앞6자리 + 뒤1자리
    
    @NotBlank(message = "비밀번호는 필수입니다.")
    private String password;
    
    @NotBlank(message = "비밀번호 확인은 필수입니다.")
    private String confirmPassword;
}

