import { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import {
  AdEventType,
  InterstitialAd,
} from 'react-native-google-mobile-ads';
import { ADMOB_IDS } from '@/constants/ads';
import { useApp } from '@/contexts/AppContext';

export function useInterstitialAd() {
  const { attResolved, removeAds } = useApp();
  const interstitialRef = useRef<ReturnType<typeof InterstitialAd.createForAdRequest> | null>(
    null
  );
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!attResolved || removeAds || Platform.OS === 'web') {
      return;
    }

    const unitId =
      Platform.OS === 'ios'
        ? ADMOB_IDS.ios.interstitial
        : ADMOB_IDS.android.interstitial;

    const interstitial = InterstitialAd.createForAdRequest(unitId);
    const unsubLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      loadedRef.current = true;
    });
    const unsubClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      loadedRef.current = false;
      interstitial.load();
    });

    interstitial.load();
    interstitialRef.current = interstitial;

    return () => {
      unsubLoaded();
      unsubClosed();
    };
  }, [attResolved, removeAds]);

  const showInterstitial = useCallback(async () => {
    if (!attResolved || removeAds || !loadedRef.current) {
      return;
    }
    try {
      await interstitialRef.current?.show();
    } catch {
      interstitialRef.current?.load();
    }
  }, [attResolved, removeAds]);

  return { showInterstitial };
}
