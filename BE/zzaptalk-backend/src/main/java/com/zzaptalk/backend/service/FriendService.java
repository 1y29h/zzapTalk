package com.zzaptalk.backend.service;

import com.zzaptalk.backend.dto.*;
import com.zzaptalk.backend.entity.Friendship;
import com.zzaptalk.backend.entity.User;
import com.zzaptalk.backend.repository.FriendshipRepository;
import com.zzaptalk.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class FriendService {

    private final UserRepository userRepository;
    private final FriendshipRepository friendshipRepository;

    // =========================================================================
    // 1. 친구 목록 조회 (메인 로직)
    // =========================================================================

    /**
     * 현재 사용자의 친구 목록을 4개 섹션으로 분류하여 반환
     * 1. 생일인 친구 (오늘 기준 ±7일)
     * 2. 즐겨찾기 친구
     * 3. 커스텀 그룹별 친구
     * 4. 기타 친구 (그룹 없음, ㄱㄴㄷ순)
     */
    @Transactional(readOnly = true)
    public FriendListResponseDto getFriendList(User currentUser) {

        // 1. 현재 유저의 모든 Friendship 관계를 가져옴
        List<Friendship> friendships = friendshipRepository.findByUser(currentUser);

        // 2. 응답 DTO와 4대 리스트 초기화
        List<FriendSummaryDto> birthdayFriends = new ArrayList<>();
        List<FriendSummaryDto> favoriteFriends = new ArrayList<>();
        Map<String, List<FriendSummaryDto>> customGroupMap = new HashMap<>();
        List<FriendSummaryDto> otherFriends = new ArrayList<>();

        // 3. 생일 기간 계산 (오늘 기준 ±7일)
        LocalDate today = LocalDate.now();
        LocalDate oneWeekAgo = today.minus(7, ChronoUnit.DAYS);
        LocalDate oneWeekLater = today.plus(7, ChronoUnit.DAYS);

        // 4. Friendship 목록을 순회하며 DTO로 변환 및 그룹핑
        for (Friendship fs : friendships) {
            User friend = fs.getFriend();

            // DTO 생성
            FriendSummaryDto dto = FriendSummaryDto.builder()
                    .userId(friend.getId())
                    .nickname(friend.getNickname())
                    .profilePhotoUrl(friend.getProfilePhotoUrl())
                    .statusMessage(friend.getStatusMessage())
                    .birthday(friend.getBirthday())
                    .isFavorite(fs.isFavorite())
                    .customGroupName(fs.getCustomGroupName())
                    .build();

            // 4-1. 생일인 친구 (오늘 기준 ±7일)
            if (friend.getBirthday() != null) {
                // 주의: 월/일만 비교 (연도는 무시)
                LocalDate friendBirthdayThisYear = friend.getBirthday().withYear(today.getYear());

                if (!friendBirthdayThisYear.isBefore(oneWeekAgo) &&
                        !friendBirthdayThisYear.isAfter(oneWeekLater)) {
                    birthdayFriends.add(dto);
                }
            }

            // 4-2. 즐겨찾기 친구
            if (fs.isFavorite()) {
                favoriteFriends.add(dto);
            }

            // 4-3. 커스텀 그룹 친구
            if (fs.getCustomGroupName() != null && !fs.getCustomGroupName().isBlank()) {
                customGroupMap
                        .computeIfAbsent(fs.getCustomGroupName(), k -> new ArrayList<>())
                        .add(dto);
            }

            // 4-4. 기타 친구 (즐겨찾기X, 커스텀그룹X)
            if (!fs.isFavorite() &&
                    (fs.getCustomGroupName() == null || fs.getCustomGroupName().isBlank())) {
                otherFriends.add(dto);
            }
        }

        // 5. 기타 친구 '닉네임' 기준 ㄱㄴㄷ순 정렬
        otherFriends.sort(Comparator.comparing(FriendSummaryDto::getNickname));

        // 6. Map -> List<FriendGroupDto> 변환 및 그룹명 ㄱㄴㄷ순 정렬
        List<FriendGroupDto> customGroups = customGroupMap.entrySet().stream()
                .map(entry -> FriendGroupDto.builder()
                        .groupName(entry.getKey())
                        .friends(entry.getValue())
                        .build())
                .sorted(Comparator.comparing(FriendGroupDto::getGroupName))
                .collect(Collectors.toList());

        // 7. 최종 DTO 조합
        return FriendListResponseDto.builder()
                .birthdayFriends(birthdayFriends)
                .favoriteFriends(favoriteFriends)
                .customGroups(customGroups)
                .otherFriends(otherFriends)
                .build();
    }

    // =========================================================================
    // 2. 친구 추가 (phoneNum 또는 zzapID)
    // =========================================================================

    /**
     * phoneNum 또는 zzapID로 친구를 추가
     * 중복 확인 및 자기 자신 추가 방지 로직 포함
     */
    public void addFriend(User currentUser, AddFriendRequest dto) {

        // 1. 추가할 유저 찾기
        User friendToAdd = null;

        if ("PHONE".equals(dto.getType()) && dto.getIdentifier() != null) {
            friendToAdd = userRepository.findByPhoneNum(dto.getIdentifier())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 전화번호입니다."));

        } else if ("ZZAPID".equals(dto.getType()) && dto.getIdentifier() != null) {
            friendToAdd = userRepository.findByZzapID(dto.getIdentifier())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 ZzapID입니다."));

        } else {
            throw new IllegalArgumentException("올바르지 않은 요청입니다.");
        }

        // 2. 자기 자신 추가 방지
        if (currentUser.getId().equals(friendToAdd.getId())) {
            throw new IllegalArgumentException("자기 자신을 친구로 추가할 수 없습니다.");
        }

        // 3. 이미 친구인지 확인
        if (friendshipRepository.existsByUserAndFriend(currentUser, friendToAdd)) {
            throw new IllegalArgumentException("이미 추가된 친구입니다.");
        }

        // 4. Friendship 엔티티 생성 및 저장
        Friendship newFriendship = Friendship.builder()
                .user(currentUser)
                .friend(friendToAdd)
                .isFavorite(false)  // 기본값
                .build();

        friendshipRepository.save(newFriendship);
    }

    // =========================================================================
    // 3. 친구 검색 (닉네임 또는 이름)
    // =========================================================================

    /**
     * 현재 사용자의 친구 목록에서 닉네임으로 검색
     */
    @Transactional(readOnly = true)
    public List<FriendSummaryDto> searchFriend(User currentUser, String nicknameQuery) {

        // 1. Repository에서 닉네임으로 1차 필터링
        List<Friendship> friendships = friendshipRepository
                .findByUserAndFriendNicknameContaining(currentUser, nicknameQuery);

        // 2. DTO로 변환하여 반환
        return friendships.stream()
                .map(fs -> FriendSummaryDto.builder()
                        .userId(fs.getFriend().getId())
                        .nickname(fs.getFriend().getNickname())
                        .profilePhotoUrl(fs.getFriend().getProfilePhotoUrl())
                        .statusMessage(fs.getFriend().getStatusMessage())
                        .birthday(fs.getFriend().getBirthday())
                        .isFavorite(fs.isFavorite())
                        .customGroupName(fs.getCustomGroupName())
                        .build())
                .collect(Collectors.toList());
    }

    // =========================================================================
    // 4. 친구 프로필 조회
    // =========================================================================

    /**
     * 친구의 프로필 상세 정보 조회
     */
    @Transactional(readOnly = true)
    public UserProfileDto getFriendProfile(User currentUser, Long friendUserId) {

        // 1. 친구 찾기
        User friend = userRepository.findById(friendUserId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        // 2. 친구 관계 확인
        if (!friendshipRepository.existsByUserAndFriend(currentUser, friend)) {
            throw new IllegalArgumentException("친구 관계가 아닙니다.");
        }

        // 3. DTO 변환
        return UserProfileDto.builder()
                .userId(friend.getId())
                .name(friend.getName())
                .nickname(friend.getNickname())
                .zzapID(friend.getZzapID())
                .profilePhotoUrl(friend.getProfilePhotoUrl())
                .backgroundPhotoUrl(friend.getBackgroundPhotoUrl())
                .statusMessage(friend.getStatusMessage())
                .birthday(friend.getBirthday())
                .build();
    }

    // =========================================================================
    // 5. 친구 설정 업데이트 (즐겨찾기, 그룹명)
    // =========================================================================

    /**
     * 친구의 즐겨찾기 상태 또는 커스텀 그룹명 변경
     */
    public void updateFriend(User currentUser, UpdateFriendRequest dto) {

        // 1. 친구 찾기
        User friend = userRepository.findById(dto.getFriendUserId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        // 2. Friendship 조회
        Friendship friendship = friendshipRepository.findByUserAndFriend(currentUser, friend)
                .orElseThrow(() -> new IllegalArgumentException("친구 관계가 아닙니다."));

        // 3. 즐겨찾기 업데이트 (값이 있는 경우에만)
        if (dto.getIsFavorite() != null) {
            friendship.setFavorite(dto.getIsFavorite());
        }

        // 4. 커스텀 그룹명 업데이트 (값이 있는 경우에만, null이면 그룹 해제)
        if (dto.getCustomGroupName() != null) {
            friendship.setCustomGroupName(
                    dto.getCustomGroupName().isBlank() ? null : dto.getCustomGroupName()
            );
        }

        // 5. 저장 (변경 감지로 자동 업데이트됨)
        friendshipRepository.save(friendship);
    }

    // =========================================================================
    // 6. 주소록 동기화 (자동 친구 추가)
    // =========================================================================

    /**
     * 사용자 주소록에 있는 전화번호 목록으로 ZZAP TALK 가입자를 자동으로 친구 추가
     */
    public List<FriendSummaryDto> syncContacts(User currentUser, SyncContactsRequest dto) {

        // 1. 주소록 전화번호로 ZZAP TALK 가입자 찾기
        List<User> registeredUsers = userRepository.findByPhoneNumIn(dto.getPhoneNumbers());

        // 2. 추가된 친구 목록 (반환용)
        List<FriendSummaryDto> addedFriends = new ArrayList<>();

        // 3. 각 사용자를 친구로 추가
        for (User friend : registeredUsers) {

            // 3-1. 자기 자신은 제외
            if (currentUser.getId().equals(friend.getId())) {
                continue;
            }

            // 3-2. 이미 친구인 경우 제외
            if (friendshipRepository.existsByUserAndFriend(currentUser, friend)) {
                continue;
            }

            // 3-3. Friendship 생성 및 저장
            Friendship newFriendship = Friendship.builder()
                    .user(currentUser)
                    .friend(friend)
                    .isFavorite(false)
                    .build();

            friendshipRepository.save(newFriendship);

            // 3-4. 추가된 친구 DTO 생성
            FriendSummaryDto friendDto = FriendSummaryDto.builder()
                    .userId(friend.getId())
                    .nickname(friend.getNickname())
                    .profilePhotoUrl(friend.getProfilePhotoUrl())
                    .statusMessage(friend.getStatusMessage())
                    .birthday(friend.getBirthday())
                    .isFavorite(false)
                    .customGroupName(null)
                    .build();

            addedFriends.add(friendDto);
        }

        return addedFriends;
    }

    // =========================================================================
    // 7. 친구 삭제
    // =========================================================================

    /**
     * 친구 삭제
     */
    public void deleteFriend(User currentUser, Long friendUserId) {

        // 1. 친구 찾기
        User friend = userRepository.findById(friendUserId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        // 2. Friendship 조회 및 삭제
        Friendship friendship = friendshipRepository.findByUserAndFriend(currentUser, friend)
                .orElseThrow(() -> new IllegalArgumentException("친구 관계가 아닙니다."));

        friendshipRepository.delete(friendship);
    }
}