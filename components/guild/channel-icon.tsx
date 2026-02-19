import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const CHANNEL_TYPE_VOICE = 2;

export function ChannelIcon({ type, color }: { type: number; color: string }) {
  if (type === CHANNEL_TYPE_VOICE) {
    return <MaterialIcons name="volume-up" size={20} color={color} />;
  }
  return <MaterialIcons name="tag" size={20} color={color} />;
}
