import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';

type Props = {
  title: string;
  subtitle?: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  accent?: boolean;
};

export default function SettingsButton({
  title,
  subtitle,
  onPress,
  disabled,
  loading,
  accent,
}: Props) {
  return (
    <TouchableOpacity
      style={[styles.button, accent && styles.accent, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
    >
      <View style={styles.textWrap}>
        <Text style={[styles.title, accent && styles.accentTitle]}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {loading ? <ActivityIndicator color="#8B0000" /> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accent: {
    backgroundColor: '#8B0000',
    borderColor: '#6B0000',
  },
  disabled: {
    opacity: 0.6,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B0000',
  },
  accentTitle: {
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 12,
    color: '#A04040',
    marginTop: 4,
  },
});
