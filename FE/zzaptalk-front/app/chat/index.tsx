import { useEffect, useState, useCallback } from "react";
import { FlatList, Pressable, Text, View, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { getChatRoomList } from "../../src/services/chat";
import type { ChatRoomUserListItem } from "../../src/types/chat";

export default function ChatListScreen() {
  const router = useRouter();
  const [rooms, setRooms] = useState<ChatRoomUserListItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const data = await getChatRoomList();
    data.sort((a, b) => {
      const ta = a.lastMessageTime ? Date.parse(a.lastMessageTime) : 0;
      const tb = b.lastMessageTime ? Date.parse(b.lastMessageTime) : 0;
      return tb - ta;
    });
    setRooms(data);
  };

  useEffect(() => {
    load();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, []);

  const openRoom = (roomId: number) => router.push(`/chat/${roomId}`);

  const Item = ({ item }: { item: ChatRoomUserListItem }) => (
    <Pressable onPress={() => openRoom(item.roomId)} className="px-4 py-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 mr-3">
          <Text className="text-base font-semibold">{item.roomName}</Text>
          {!!item.lastMessageContent && (
            <Text numberOfLines={1} className="text-sm opacity-70">
              {item.lastMessageContent}
            </Text>
          )}
        </View>
        {item.unreadCount > 0 && (
          <View className="px-2 py-1 rounded-full bg-blue-500">
            <Text className="text-white text-xs">{item.unreadCount}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );

  return (
    <FlatList
      data={rooms}
      keyExtractor={(x) => String(x.roomId)}
      renderItem={Item}
      ItemSeparatorComponent={() => (
        <View className="h-px bg-neutral-200 opacity-60" />
      )}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );
}
