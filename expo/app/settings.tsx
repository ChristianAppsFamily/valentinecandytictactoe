import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SettingsButton from '@/components/SettingsButton';
import {
  APP_DISPLAY_NAME,
  PRIVACY_POLICY_URL,
  REMOVE_ADS_PRICE,
  SETTINGS_LINKS,
} from '@/constants/app';
import { THEMES, ThemeId } from '@/constants/themes';
import { useApp, useActiveTheme } from '@/contexts/AppContext';
import { purchaseRemoveAds, restorePurchases } from '@/lib/iap';
import { setDailyVerseNotifications } from '@/lib/notifications';
import { getDailyVerseEnabled } from '@/lib/storage';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useActiveTheme();
  const { removeAds, themeId, setThemeId, refreshRemoveAds, setRemoveAds } =
    useApp();
  const [dailyVerse, setDailyVerse] = useState(false);
  const [iapLoading, setIapLoading] = useState(false);

  useEffect(() => {
    void getDailyVerseEnabled().then(setDailyVerse);
  }, []);

  const handleRemoveAds = useCallback(async () => {
    if (removeAds) {
      Alert.alert('Pro Active', 'Ads are already removed. Thank you!');
      return;
    }
    setIapLoading(true);
    const result = await purchaseRemoveAds();
    setIapLoading(false);
    if (result.success) {
      setRemoveAds(true);
      Alert.alert('Thank you!', 'Remove Ads Pro is now active.');
    } else if (result.message) {
      Alert.alert('Purchase', result.message);
    }
  }, [removeAds, setRemoveAds]);

  const handleRestore = useCallback(async () => {
    setIapLoading(true);
    const result = await restorePurchases();
    setIapLoading(false);
    await refreshRemoveAds();
    Alert.alert(result.success ? 'Restored' : 'Restore', result.message);
  }, [refreshRemoveAds]);

  const handleDailyVerseToggle = useCallback(async (value: boolean) => {
    const ok = await setDailyVerseNotifications(value);
    setDailyVerse(ok && value);
    if (value && !ok) {
      Alert.alert(
        'Notifications',
        'Please enable notifications in Settings to receive daily verses at 7 AM Pacific.'
      );
    }
  }, []);

  const selectTheme = useCallback(
    (id: ThemeId) => {
      const t = THEMES.find((x) => x.id === id);
      if (!t) return;
      if (t.proOnly && !removeAds) {
        Alert.alert(
          'Pro Feature',
          `Custom themes are included with Remove Ads Pro (${REMOVE_ADS_PRICE}).`
        );
        return;
      }
      void setThemeId(id);
    },
    [removeAds, setThemeId]
  );

  const openUrl = useCallback(async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  }, []);

  const openEmail = useCallback(async () => {
    const url = `mailto:${SETTINGS_LINKS.contactEmail}?subject=${encodeURIComponent(APP_DISPLAY_NAME)}`;
    const can = await Linking.canOpenURL(url);
    if (can) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Contact', SETTINGS_LINKS.contactEmail);
    }
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.background}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={[styles.backText, { color: theme.title }]}>← Back</Text>
        </TouchableOpacity>

        <Text style={[styles.heading, { color: theme.title }]}>Settings</Text>

        <Text style={[styles.sectionLabel, { color: theme.title }]}>Pro</Text>
        <SettingsButton
          title={removeAds ? 'Remove Ads Pro — Active' : `Remove Ads Pro — ${REMOVE_ADS_PRICE}`}
          subtitle="One-time purchase. Removes banner and interstitial ads."
          onPress={handleRemoveAds}
          loading={iapLoading}
          accent={!removeAds}
        />
        <SettingsButton title="Restore Purchases" onPress={handleRestore} loading={iapLoading} />

        <Text style={[styles.sectionLabel, { color: theme.title }]}>Custom Themes</Text>
        <View style={styles.themeRow}>
          {THEMES.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[
                styles.themeChip,
                themeId === t.id && styles.themeChipActive,
                t.proOnly && !removeAds && styles.themeLocked,
              ]}
              onPress={() => selectTheme(t.id)}
            >
              <LinearGradient
                colors={[t.background[0], t.background[2]]}
                style={styles.themeSwatch}
              />
              <Text style={styles.themeChipText}>
                {t.name}
                {t.proOnly ? ' ★' : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionLabel, { color: theme.title }]}>Notifications</Text>
        <View style={styles.switchRow}>
          <View style={styles.switchText}>
            <Text style={styles.switchTitle}>Daily Bible Verse</Text>
            <Text style={styles.switchSub}>7:00 AM Pacific Time</Text>
          </View>
          <Switch
            value={dailyVerse}
            onValueChange={handleDailyVerseToggle}
            trackColor={{ true: '#8B0000', false: '#ccc' }}
          />
        </View>

        <Text style={[styles.sectionLabel, { color: theme.title }]}>Connect</Text>
        <SettingsButton title="Facebook" onPress={() => openUrl(SETTINGS_LINKS.facebook)} />
        <SettingsButton
          title="Follow Us on Instagram"
          onPress={() => openUrl(SETTINGS_LINKS.instagram)}
        />
        <SettingsButton
          title="Join Our Community"
          subtitle="proverbs31way.com (women only)"
          onPress={() => openUrl(SETTINGS_LINKS.community)}
        />
        <SettingsButton title="Contact Us" onPress={openEmail} />
        <SettingsButton title="More Apps" onPress={() => openUrl(SETTINGS_LINKS.moreApps)} />

        <Text style={[styles.sectionLabel, { color: theme.title }]}>Legal</Text>
        <SettingsButton
          title="Privacy Policy"
          onPress={() => openUrl(PRIVACY_POLICY_URL)}
        />

        <View style={styles.footer}>
          <Text style={[styles.footerTitle, { color: theme.title }]}>
            {APP_DISPLAY_NAME}
          </Text>
          <Text style={styles.footerLine}>Developed By</Text>
          <Text style={styles.footerLine}>Christian App Empire LLC</Text>
          <Text style={styles.footerCopy}>
            Copyright © 2026 Christian App Empire LLC{'\n'}All Rights Reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  back: { marginBottom: 8 },
  backText: { fontSize: 17, fontWeight: '600' },
  heading: { fontSize: 28, fontWeight: '800', marginBottom: 16 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 8,
    marginBottom: 8,
    opacity: 0.85,
  },
  themeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  themeChip: {
    width: '47%',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeChipActive: { borderColor: '#8B0000' },
  themeLocked: { opacity: 0.65 },
  themeSwatch: { height: 36, borderRadius: 8, marginBottom: 6 },
  themeChipText: { fontSize: 12, fontWeight: '600', color: '#8B0000' },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  switchText: { flex: 1 },
  switchTitle: { fontSize: 16, fontWeight: '700', color: '#8B0000' },
  switchSub: { fontSize: 12, color: '#A04040', marginTop: 4 },
  footer: {
    marginTop: 28,
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerTitle: { fontSize: 16, fontWeight: '800', marginBottom: 8 },
  footerLine: { fontSize: 14, color: '#6B3030', fontWeight: '600' },
  footerCopy: {
    fontSize: 12,
    color: '#6B3030',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 18,
  },
});
