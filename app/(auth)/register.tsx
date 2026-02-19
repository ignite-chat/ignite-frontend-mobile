import { useState, useRef } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  View,
} from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import ConfirmHcaptcha from '@hcaptcha/react-native-hcaptcha';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/contexts/auth-context';
import { register } from '@/services/auth';
import { useColorScheme } from '@/hooks/use-color-scheme';

const HCAPTCHA_SITE_KEY = '00000000-0000-0000-0000-000000000000';
const HCAPTCHA_BASE_URL = 'https://hcaptcha.com';

export default function RegisterScreen() {
  const { signIn } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const captchaRef = useRef<ConfirmHcaptcha>(null);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const inputBg = colorScheme === 'dark' ? '#1e2022' : '#f0f2f5';
  const inputBorder = colorScheme === 'dark' ? '#2e3234' : '#d0d5dd';
  const placeholderColor = colorScheme === 'dark' ? '#6b7280' : '#9ca3af';

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

    // data is the hCaptcha token
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
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              Ignite
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Create an account to get started.
            </ThemedText>
          </View>

          <View style={styles.form}>
            <View style={styles.field}>
              <ThemedText style={styles.label}>
                Username <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: inputBg,
                    borderColor: inputBorder,
                    color: textColor,
                  },
                ]}
                placeholder="Choose a username"
                placeholderTextColor={placeholderColor}
                autoCapitalize="none"
                autoCorrect={false}
                value={username}
                onChangeText={setUsername}
                editable={!loading}
              />
            </View>

            <View style={styles.field}>
              <ThemedText style={styles.label}>Email</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: inputBg,
                    borderColor: inputBorder,
                    color: textColor,
                  },
                ]}
                placeholder="Enter your email (optional)"
                placeholderTextColor={placeholderColor}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                editable={!loading}
              />
            </View>

            <View style={styles.field}>
              <ThemedText style={styles.label}>Password</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: inputBg,
                    borderColor: inputBorder,
                    color: textColor,
                  },
                ]}
                placeholder="Create a password (optional)"
                placeholderTextColor={placeholderColor}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />
            </View>

            {password ? (
              <View style={styles.field}>
                <ThemedText style={styles.label}>Confirm Password</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: inputBg,
                      borderColor: inputBorder,
                      color: textColor,
                    },
                  ]}
                  placeholder="Confirm your password"
                  placeholderTextColor={placeholderColor}
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  editable={!loading}
                  onSubmitEditing={handlePress}
                />
              </View>
            ) : null}

            {error ? (
              <ThemedText style={styles.error}>{error}</ThemedText>
            ) : null}

            <TouchableOpacity
              style={[styles.button, { backgroundColor: tintColor }]}
              onPress={handlePress}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText
                  style={[
                    styles.buttonText,
                    { color: colorScheme === 'dark' ? '#000' : '#fff' },
                  ]}
                >
                  Create Account
                </ThemedText>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>
              Already have an account?{' '}
            </ThemedText>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <ThemedText style={[styles.footerLink, { color: tintColor }]}>
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
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  form: {
    gap: 16,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  required: {
    color: '#ef4444',
  },
  input: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  error: {
    color: '#ef4444',
    fontSize: 14,
  },
  button: {
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
