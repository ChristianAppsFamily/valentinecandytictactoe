import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import {
  BannerAd,
  BannerAdSize,
} from 'react-native-google-mobile-ads';
import { ADMOB_IDS } from '@/constants/ads';
import { useApp } from '@/contexts/AppContext';

export default function AdBanner() {
  const { attResolved, removeAds } = useApp();

  if (!attResolved || removeAds || Platform.OS === 'web') {
    return null;
  }

  const unitId =
    Platform.OS === 'ios' ? ADMOB_IDS.ios.banner : ADMOB_IDS.android.banner;

  return (
    <View style={styles.container}>
      <BannerAd unitId={unitId} size={BannerAdSize.BANNER} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 4,
  },
});
