import { Image } from 'expo-image';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiRequest } from '@/services/api';
import { type User } from '@/services/auth';
import { Colors, TextStyles } from '@/theme';
import { CDN_BASE } from '@/utils/cdn';

export default function YouScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, signOut, signIn, token } = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [saving, setSaving] = useState(false);

  const avatarUrl = user?.avatar_url
    ? `${CDN_BASE}/avatars/${user.avatar_url}`
    : null;

  const hasChanges =
    name !== (user?.name ?? '') ||
    username !== (user?.username ?? '') ||
    email !== (user?.email ?? '');

  async function handleSave() {
    if (!hasChanges || saving) return;
    setSaving(true);

    const body: Record<string, unknown> = {};
    if (name !== user?.name) body.name = name;
    if (username !== user?.username) body.username = username;
    if (email !== (user?.email ?? '')) body.email = email || null;

    const res = await apiRequest<User>('/@me', { method: 'PATCH', body });

    if (res.ok && token) {
      signIn(token, res.data);
    } else if (!res.ok) {
      Alert.alert('Error', res.message);
    }

    setSaving(false);
  }

  function handleLogout() {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: signOut },
    ]);
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      <View style={styles.avatarSection}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.tint }]}>
            <ThemedText style={styles.avatarInitial}>
              {(user?.name ?? '?')[0].toUpperCase()}
            </ThemedText>
          </View>
        )}
      </View>

      <View style={styles.fields}>
        <ThemedText style={[TextStyles.label, styles.label, { color: colors.textSecondary }]}>
          Display Name
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            TextStyles.body,
            {
              backgroundColor: colors.surfaceRaised,
              borderColor: colors.inputBorder,
              color: colors.text,
            },
          ]}
          value={name}
          onChangeText={setName}
          placeholder="Display Name"
          placeholderTextColor={colors.placeholder}
        />

        <ThemedText style={[TextStyles.label, styles.label, { color: colors.textSecondary }]}>
          Username
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            TextStyles.body,
            {
              backgroundColor: colors.surfaceRaised,
              borderColor: colors.inputBorder,
              color: colors.text,
            },
          ]}
          value={username}
          onChangeText={setUsername}
          placeholder="Username"
          placeholderTextColor={colors.placeholder}
          autoCapitalize="none"
        />

        <ThemedText style={[TextStyles.label, styles.label, { color: colors.textSecondary }]}>
          Email
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            TextStyles.body,
            {
              backgroundColor: colors.surfaceRaised,
              borderColor: colors.inputBorder,
              color: colors.text,
            },
          ]}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={colors.placeholder}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {hasChanges && (
        <Pressable
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: colors.tint, opacity: pressed || saving ? 0.7 : 1 },
          ]}
          onPress={handleSave}
          disabled={saving}>
          <ThemedText style={[TextStyles.button, { color: '#fff' }]}>
            {saving ? 'Saving...' : 'Save Changes'}
          </ThemedText>
        </Pressable>
      )}

      <Pressable
        style={({ pressed }) => [
          styles.button,
          styles.logoutButton,
          {
            borderColor: colors.error,
            backgroundColor: 'rgba(240, 68, 56, 0.08)',
            opacity: pressed ? 0.7 : 1,
          },
        ]}
        onPress={handleLogout}>
        <ThemedText style={[TextStyles.button, { color: colors.error }]}>
          Log Out
        </ThemedText>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '700',
  },
  fields: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 8,
    marginTop: 20,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  logoutButton: {
    marginTop: 20,
    borderWidth: 1,
  },
});
