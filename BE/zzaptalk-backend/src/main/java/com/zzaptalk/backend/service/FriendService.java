package com.zzaptalk.backend.service;

import com.zzaptalk.backend.dto.*;
import com.zzaptalk.backend.entity.FriendGroup;
import com.zzaptalk.backend.entity.FriendGroupMapping;
import com.zzaptalk.backend.entity.Friendship;
import com.zzaptalk.backend.entity.User;
import com.zzaptalk.backend.repository.FriendGroupMappingRepository;
import com.zzaptalk.backend.repository.FriendGroupRepository;
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
    private final FriendGroupRepository friendGroupRepository;
    private final FriendGroupMappingRepository friendGroupMappingRepository;

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
        // Key를 String(groupName)에서 Long(groupId)으로 변경
        Map<Long, FriendGroupDto> customGroupMap = new HashMap<>();
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
                    .friendshipId(fs.getId())  // Friendship의 ID를 추가
                    .nickname(friend.getNickname())
                    .profilePhotoUrl(friend.getProfilePhotoUrl())
                    .statusMessage(friend.getStatusMessage())
                    .birthday(friend.getBirthday())
                    .isFavorite(fs.isFavorite())
                    .groups(fs.getGroupMappings().stream()
                            .map(mapping -> GroupSimpleDto.builder()  // 친구 목록 응답시 dto 수정
                                    .groupName(mapping.getFriendGroup().getGroupName())
                                    .groupId(mapping.getFriendGroup().getId()) // groupId 추가
                                    .build())
                            .collect(Collectors.toList()))
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

            // 4-3. 커스텀 그룹 친구 (로직 변경)
            // 수정: 각 Friendship의 groupMappings를 순회하며 각 그룹에 친구 추가
            for (FriendGroupMapping mapping : fs.getGroupMappings()) {
                FriendGroup group = mapping.getFriendGroup();

                // 맵에서 groupId(Long)를 키로 DTO를 찾거나 새로 생성
                FriendGroupDto groupDto = customGroupMap.computeIfAbsent(group.getId(), k ->
                        FriendGroupDto.builder()
                                .groupId(group.getId()) // ID 설정
                                .groupName(group.getGroupName()) // 이름 설정
                                .friends(new ArrayList<>()) // 친구 리스트 초기화
                                .build()
                );
                // 해당 그룹 DTO에 현재 친구 DTO를 추가
                groupDto.getFriends().add(dto);
            }

            // 4-4. 기타 친구 (즐겨찾기X, 커스텀그룹X)
            if (!fs.isFavorite() &&
                    // 수정: groupMappings가 비어있는지 확인
                    fs.getGroupMappings().isEmpty()) {
                otherFriends.add(dto);
            }
        }

        // 5. 기타 친구 '닉네임' 기준 ㄱㄴㄷ순 정렬
        otherFriends.sort(Comparator.comparing(FriendSummaryDto::getNickname));

        // 6. Map -> List<FriendGroupDto> 변환 및 그룹명 ㄱㄴㄷ순 정렬 (로직 변경)
        // 맵의 '값(valuse)'들이 이미 완성된 DTO이므로, 이 값들을 모아서 정렬
        List<FriendGroupDto> customGroups = customGroupMap.values().stream()
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
                        .friendshipId(fs.getId())  // Friendship의 ID를 추가
                        .nickname(fs.getFriend().getNickname())
                        .profilePhotoUrl(fs.getFriend().getProfilePhotoUrl())
                        .statusMessage(fs.getFriend().getStatusMessage())
                        .birthday(fs.getFriend().getBirthday())
                        .isFavorite(fs.isFavorite())
                        .groups(fs.getGroupMappings().stream()
                                .map(mapping -> GroupSimpleDto.builder()
                                        .groupName(mapping.getFriendGroup().getGroupName())
                                        .groupId(mapping.getFriendGroup().getId()) // 이것도 추가
                                        .build())
                                .collect(Collectors.toList()))
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
                    .friendshipId(newFriendship.getId())  // 방금 생성한 Friendship의 ID
                    .nickname(friend.getNickname())
                    .profilePhotoUrl(friend.getProfilePhotoUrl())
                    .statusMessage(friend.getStatusMessage())
                    .birthday(friend.getBirthday())
                    .isFavorite(false)
                    //.customGroupName(null)
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

    // ============================
    // 8. 그룹 생성 메서드 추가
    // ============================
    // 반환 타입을 FriendGroup -> GroupResponseDto 로 변경
    public GroupResponseDto createGroup(Long userId, String groupName) { // 1. 반환 타입 변경 (그룹 목록 조회 할 때 Dto 새로 만듦)
        // 1. 중복 체크
        if (friendGroupRepository.existsByUserIdAndGroupName(userId, groupName)) {
            throw new IllegalArgumentException("이미 존재하는 그룹명입니다.");
        }

        // 2. 그룹 생성
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        FriendGroup group = FriendGroup.builder()
                .user(user)
                .groupName(groupName)
                .build();

        // 3. 일단 entity로 저장
        FriendGroup savedGroup = friendGroupRepository.save(group);

        // 4. DTO로 변환하여 반환
        return new GroupResponseDto(savedGroup);
    }



    // ================
    // 9. 친구를 그룹에 추가
    // =================================
    // 새 메서드:
    public void addFriendToGroup(Long currentUserId, Long friendshipId, Long groupId) {
        // 1. 중복 체크
        if (friendGroupMappingRepository.existsByFriendshipIdAndFriendGroupId(friendshipId, groupId)) {
            throw new IllegalArgumentException("이미 해당 그룹에 추가된 친구입니다.");
        }

        // 2. Friendship과 FriendGroup 존재 여부 확인
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new IllegalArgumentException("친구 관계를 찾을 수 없습니다."));

        FriendGroup group = friendGroupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("그룹을 찾을 수 없습니다."));

        // 2.5. 권한 검증
        // 해당 friendship이 현재 사용자의 것인지 확인
        if (!friendship.getUser().getId().equals(currentUserId)) {
            throw new IllegalArgumentException("본인의 친구만 그룹에 추가할 수 있습니다.");
        }

        // 해당 group이 현재 사용자의 것인지 확인
        if (!group.getUser().getId().equals(currentUserId)) {
            throw new IllegalArgumentException("본인의 그룹에만 친구를 추가할 수 있습니다.");
        }

        // 3. 매핑 생성
        FriendGroupMapping mapping = FriendGroupMapping.builder()
                .friendship(friendship)
                .friendGroup(group)
                .build();

        friendGroupMappingRepository.save(mapping);
    }

    // ===========
    // 10. 그룹에서 친구 제거
    //     -> 그룹에서만 제거하고 친구관계는 유지해야되서
    // ===================
    // 새 메서드:
    @Transactional
    public void removeFriendFromGroup(Long currentUserId, Long friendshipId, Long groupId) {
        // 1. 존재 여부 및 권한 확인
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new IllegalArgumentException("친구 관계를 찾을 수 없습니다."));

        FriendGroup group = friendGroupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("그룹을 찾을 수 없습니다."));

        // 2. 권한 검증
        if (!friendship.getUser().getId().equals(currentUserId)) {
            throw new IllegalArgumentException("본인의 친구만 그룹에서 제거할 수 있습니다.");
        }

        if (!group.getUser().getId().equals(currentUserId)) {
            throw new IllegalArgumentException("본인의 그룹에서만 친구를 제거할 수 있습니다.");
        }

        // 3. 삭제 실행
        friendGroupMappingRepository.deleteByFriendshipIdAndFriendGroupId(friendshipId, groupId);
    }

    // ===========
    // 11. 내 그룹 목록 조회
    // ===========
    // 반환 타입을 List<FriendGroup> -> List<GroupRespnseDto>로 변경
    @Transactional(readOnly = true)
    public List<GroupResponseDto> getMyGroups(Long userId) { // 1. 반환 타입 변경
        // 2. 엔티티 리스트 조회
        List<FriendGroup> groups = friendGroupRepository.findByUserId(userId);

        // 3. DTO 리스트로 변환 (Stream 사용)
        return groups.stream()
                .map(GroupResponseDto::new) // .map(group -> new GroupResponseDto(group)) 와 도일
                .collect(Collectors.toList());
    }


    // =========================================================================
    // 12. 그룹 삭제
    // =========================================================================
    /*
     * 그룹을 삭제 (연관된 FriendGroupMapping도 Cascade로 자동 삭제됨)
     */
    @Transactional
    public void deleteGroup(Long userId, Long groupId) {
        // 1. 그룹 존재 여부 확인
        FriendGroup group = friendGroupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 그룹입니다."));

        // 2. 권한 검증 (본인의 그룹인지 확인)
        if (!group.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("본인의 그룹만 삭제할 수 있습니다.");
        }

        // 3. 그룹 삭제 (FriendGroupMapping은 CASCADE로 자동 삭제)
        friendGroupRepository.delete(group);
    }






}