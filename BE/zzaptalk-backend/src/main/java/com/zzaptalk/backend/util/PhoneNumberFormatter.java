package com.zzaptalk.backend.util;

public class PhoneNumberFormatter {
    
    /**
     * 전화번호에 하이픈 자동 추가
     * 입력: "01012345678" 또는 "010-1234-5678"
     * 출력: "010-1234-5678"
     */
    public static String format(String phoneNumber) {
        if (phoneNumber == null) {
            return null;
        }
        
        // 하이픈 제거
        String digitsOnly = phoneNumber.replaceAll("[^0-9]", "");
        
        // 11자리가 아니면 원본 반환
        if (digitsOnly.length() != 11) {
            return phoneNumber;
        }
        
        // 010-1234-5678 형식으로 포맷팅
        return digitsOnly.substring(0, 3) + "-" + 
               digitsOnly.substring(3, 7) + "-" + 
               digitsOnly.substring(7);
    }
    
    /**
     * 전화번호에서 하이픈 제거
     */
    public static String removeHyphens(String phoneNumber) {
        if (phoneNumber == null) {
            return null;
        }
        return phoneNumber.replaceAll("-", "");
    }
}

