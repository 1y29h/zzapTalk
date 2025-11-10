package com.zzaptalk.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 커스텀 그룹별 DTO
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendGroupDto {

    // 그룹명
    private String groupName;

    // 해당 그룹에 속한 친구 목록
    private List<FriendSummaryDto> friends;
}