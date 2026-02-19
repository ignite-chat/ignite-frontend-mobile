import { useColorScheme as useRNColorScheme } from 'react-native';
import { COLOR_MODE } from '@/theme';

export function useColorScheme(): 'light' | 'dark' {
  const systemScheme = useRNColorScheme();
  if (COLOR_MODE === 'system') {
    return systemScheme ?? 'light';
  }
  return COLOR_MODE;
}
