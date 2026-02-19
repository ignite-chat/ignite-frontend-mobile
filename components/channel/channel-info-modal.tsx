import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/theme';
import { GuildsService } from '@/services/guilds';
import { useGuildsStore } from '@/stores/guild-store';

type ChannelInfoModalProps = {
  visible: boolean;
  channelName: string;
  guildId: string;
  colors: typeof Colors.light;
  onClose: () => void;
};

const EMPTY_MEMBERS: any[] = [];

export function ChannelInfoModal({ visible, channelName, guildId, colors, onClose }: ChannelInfoModalProps) {
  const [activeTab, setActiveTab] = useState<'members' | 'media'>('members');
  const members = useGuildsStore((s) => s.guildMembers[guildId] ?? EMPTY_MEMBERS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible || !guildId || members.length > 0) return;
    setLoading(true);
    GuildsService.loadGuildMembers(guildId).finally(() => setLoading(false));
  }, [visible, guildId, members.length]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.content, { backgroundColor: colors.background }]} onPress={() => {}}>
          <View style={[styles.handle, { backgroundColor: colors.placeholder }]} />
          <ThemedText style={styles.title}>{channelName}</ThemedText>

          <View style={[styles.tabBar, { borderBottomColor: colors.inputBorder }]}>
            <Pressable
              style={[styles.tab, activeTab === 'members' && { borderBottomColor: colors.tint }]}
              onPress={() => setActiveTab('members')}>
              <ThemedText style={[styles.tabText, activeTab === 'members' && { color: colors.tint }]}>
                Member List
              </ThemedText>
            </Pressable>
            <Pressable
              style={[styles.tab, activeTab === 'media' && { borderBottomColor: colors.tint }]}
              onPress={() => setActiveTab('media')}>
              <ThemedText style={[styles.tabText, activeTab === 'media' && { color: colors.tint }]}>
                Media
              </ThemedText>
            </Pressable>
          </View>

          {activeTab === 'members' ? (
            loading ? (
              <View style={styles.centered}>
                <ActivityIndicator size="small" color={colors.tint} />
              </View>
            ) : (
              <FlatList
                data={members}
                keyExtractor={(item) => item.user_id}
                renderItem={({ item }) => (
                  <View style={styles.memberRow}>
                    {item.user?.avatar_url ? (
                      <Image source={{ uri: item.user.avatar_url }} style={styles.memberAvatar} />
                    ) : (
                      <View style={[styles.memberAvatarPlaceholder, { backgroundColor: colors.tint }]}>
                        <ThemedText style={styles.memberAvatarInitial}>
                          {item.user?.name?.[0]?.toUpperCase() ?? '?'}
                        </ThemedText>
                      </View>
                    )}
                    <View style={styles.memberInfo}>
                      <ThemedText style={styles.memberName} numberOfLines={1}>
                        {item.user?.name ?? 'Unknown'}
                      </ThemedText>
                      <ThemedText style={[styles.memberUsername, { color: colors.placeholder }]} numberOfLines={1}>
                        @{item.user?.username ?? 'unknown'}
                      </ThemedText>
                    </View>
                  </View>
                )}
                contentContainerStyle={members.length === 0 ? styles.centered : styles.memberList}
                ListEmptyComponent={
                  <ThemedText style={{ color: colors.placeholder }}>No members to show</ThemedText>
                }
              />
            )
          ) : (
            <View style={styles.centered}>
              <ThemedText style={{ color: colors.placeholder }}>No media to show</ThemedText>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    height: '60%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberList: {
    paddingVertical: 8,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  memberAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarInitial: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
  },
  memberUsername: {
    fontSize: 13,
    marginTop: 1,
  },
});
