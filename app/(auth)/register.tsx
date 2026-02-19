import ConfirmHcaptcha from '@hcaptcha/react-native-hcaptcha';
import { Link } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { register } from '@/services/auth';
import { Colors, TextStyles } from '@/theme';

const HCAPTCHA_SITE_KEY = '00000000-0000-0000-0000-000000000000';
const HCAPTCHA_BASE_URL = 'https://hcaptcha.com';

export default function RegisterScreen() {
  const { signIn } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const captchaRef = useRef<ConfirmHcaptcha>(null);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handlePress() {
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    if (!/^[a-zA-Z0-9-]+$/.test(username.trim())) {
      setError('Username can only contain letters, numbers, and hyphens');
      return;
    }
    if (password && password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    captchaRef.current?.show();
  }

  async function handleCaptchaMessage(event: any) {
    if (!event?.nativeEvent?.data) return;

    const data = event.nativeEvent.data;

    if (data === 'open') return;

    captchaRef.current?.hide();

    if (data === 'cancel' || data === 'error' || data === 'challenge-expired') {
      if (data === 'challenge-expired') {
        setError('Captcha expired, please try again');
      }
      return;
    }

    setLoading(true);
    const result = await register(
      username.trim(),
      data,
      email.trim() || undefined,
      password || undefined,
    );

    if (result.ok) {
      signIn(result.data.token, result.data.user);
    } else {
      setError(result.message);
    }
    setLoading(false);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <ThemedText type="display" style={styles.title}>
              Ignite
            </ThemedText>
            <ThemedText style={[TextStyles.body, { color: colors.textSecondary }]}>
              Create an account to get started.
            </ThemedText>
          </View>

          <View style={styles.form}>
            <View style={styles.field}>
              <ThemedText style={[TextStyles.label, { color: colors.textSecondary }]}>
                Username <ThemedText style={{ color: colors.error }}>*</ThemedText>
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
                placeholder="Choose a username"
                placeholderTextColor={colors.placeholder}
                autoCapitalize="none"
                autoCorrect={false}
                value={username}
                onChangeText={setUsername}
                editable={!loading}
              />
            </View>

            <View style={styles.field}>
              <ThemedText style={[TextStyles.label, { color: colors.textSecondary }]}>
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
                placeholder="Enter your email (optional)"
                placeholderTextColor={colors.placeholder}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                editable={!loading}
              />
            </View>

            <View style={styles.field}>
              <ThemedText style={[TextStyles.label, { color: colors.textSecondary }]}>
                Password
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
                placeholder="Create a password (optional)"
                placeholderTextColor={colors.placeholder}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />
            </View>

            {password ? (
              <View style={styles.field}>
                <ThemedText style={[TextStyles.label, { color: colors.textSecondary }]}>
                  Confirm Password
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
                  placeholder="Confirm your password"
                  placeholderTextColor={colors.placeholder}
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  editable={!loading}
                  onSubmitEditing={handlePress}
                />
              </View>
            ) : null}

            {error ? (
              <ThemedText style={[TextStyles.bodySmall, { color: colors.error }]}>
                {error}
              </ThemedText>
            ) : null}

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.tint }]}
              onPress={handlePress}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={[TextStyles.button, { color: '#fff' }]}>
                  Create Account
                </ThemedText>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <ThemedText style={[TextStyles.bodySmall, { color: colors.textSecondary }]}>
              Already have an account?{' '}
            </ThemedText>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <ThemedText style={[TextStyles.bodySmall, { color: colors.tint, fontWeight: '600' }]}>
                  Sign In
                </ThemedText>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ConfirmHcaptcha
        ref={captchaRef}
        siteKey={HCAPTCHA_SITE_KEY}
        baseUrl={HCAPTCHA_BASE_URL}
        languageCode="en"
        size="invisible"
        onMessage={handleCaptchaMessage}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    marginBottom: 36,
  },
  title: {
    marginBottom: 10,
  },
  form: {
    gap: 16,
  },
  field: {
    gap: 8,
  },
  input: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  button: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
});
