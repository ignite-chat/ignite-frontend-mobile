import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { GuildsService } from '@/services/guilds';
import { useGuildsStore } from '@/stores/guild-store';
import { Colors, TextStyles } from '@/theme';
import { Image } from 'expo-image';

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
    console.log(visible, guildId, members);
    if (!visible || !guildId || members.length > 0) return;
    setLoading(true);
    GuildsService.loadGuildMembers(guildId).finally(() => setLoading(false));
  }, [visible, guildId, members.length]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.content, { backgroundColor: colors.surfaceRaised }]} onPress={() => { }}>
          <View style={[styles.handle, { backgroundColor: colors.separator }]} />
          <ThemedText style={[TextStyles.title, styles.title]}>{channelName}</ThemedText>

          <View style={[styles.tabBar, { borderBottomColor: colors.separator }]}>
            <Pressable
              style={[styles.tab, activeTab === 'members' && { borderBottomColor: colors.tint }]}
              onPress={() => setActiveTab('members')}>
              <ThemedText style={[TextStyles.heading, activeTab === 'members' && { color: colors.tint }]}>
                Member List
              </ThemedText>
            </Pressable>
            <Pressable
              style={[styles.tab, activeTab === 'media' && { borderBottomColor: colors.tint }]}
              onPress={() => setActiveTab('media')}>
              <ThemedText style={[TextStyles.heading, activeTab === 'media' && { color: colors.tint }]}>
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
            <View style={styles.tabContent}>
              <ThemedText style={{ color: colors.textMuted }}>No media to show</ThemedText>
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  content: {
    height: '60%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 12,
  },
  title: {
    marginBottom: 16,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
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
