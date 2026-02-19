import ConfirmHcaptcha from '@hcaptcha/react-native-hcaptcha';
import { Link } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { login } from '@/services/auth';

const HCAPTCHA_SITE_KEY = '78b0437e-9a22-4e50-aae6-26ae467445d8';
const HCAPTCHA_BASE_URL = 'https://hcaptcha.com';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const captchaRef = useRef<ConfirmHcaptcha>(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
    if (!password) {
      setError('Password is required');
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
    const result = await login(username.trim(), password, data);

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
        style={styles.inner}
      >
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Ignite
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Welcome back! Sign in to continue.
          </ThemedText>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <ThemedText style={styles.label}>Username</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: inputBg,
                  borderColor: inputBorder,
                  color: textColor,
                },
              ]}
              placeholder="Enter your username"
              placeholderTextColor={placeholderColor}
              autoCapitalize="none"
              autoCorrect={false}
              value={username}
              onChangeText={setUsername}
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
              placeholder="Enter your password"
              placeholderTextColor={placeholderColor}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!loading}
              onSubmitEditing={handlePress}
            />
          </View>

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
                Sign In
              </ThemedText>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>
            Don't have an account?{' '}
          </ThemedText>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <ThemedText style={[styles.footerLink, { color: tintColor }]}>
                Sign Up
              </ThemedText>
            </TouchableOpacity>
          </Link>
        </View>
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
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
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
