import { Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { TextStyles } from '@/theme';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'display' | 'title' | 'heading' | 'body' | 'bodySmall' | 'label' | 'caption' | 'button';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  const typeStyle = type === 'default' || type === 'body'
    ? TextStyles.body
    : TextStyles[type];

  return (
    <Text
      style={[{ color }, typeStyle, style]}
      {...rest}
    />
  );
}
