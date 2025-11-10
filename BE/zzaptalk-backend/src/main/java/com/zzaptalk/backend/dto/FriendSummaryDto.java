package com.zzaptalk.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * 친구 목록에 표시될 친구 요약 정보
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendSummaryDto {

    // 친구의 User ID
    private Long userId;

    // 닉네임
    private String nickname;

    // 프로필 사진 URL
    private String profilePhotoUrl;

    // 상태 메시지
    private String statusMessage;

    // 생일
    private LocalDate birthday;

    // 즐겨찾기 여부
    private boolean isFavorite;

    // 커스텀 그룹명
    private String customGroupName;
}