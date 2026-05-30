import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Alert, Platform } from 'react-native';
import { DEFAULT_THEME_ID, getThemeById, ThemeId } from '@/constants/themes';
import { requestAttPermission } from '@/lib/att';
import { initPurchases } from '@/lib/iap';
import {
  requestNotificationPermission,
  syncDailyVerseFromStorage,
} from '@/lib/notifications';
import { recordAppVisit, maybePromptRateApp } from '@/lib/rateApp';
import {
  getNotificationsAsked,
  getRemoveAdsPurchased,
  getThemeId,
  setNotificationsAsked,
  setThemeId as persistThemeId,
} from '@/lib/storage';

type AppContextValue = {
  isReady: boolean;
  attResolved: boolean;
  removeAds: boolean;
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
  refreshRemoveAds: () => Promise<void>;
  setRemoveAds: (value: boolean) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [attResolved, setAttResolved] = useState(false);
  const [removeAds, setRemoveAdsState] = useState(false);
  const [themeId, setThemeIdState] = useState<ThemeId>(DEFAULT_THEME_ID);

  const refreshRemoveAds = useCallback(async () => {
    setRemoveAdsState(await getRemoveAdsPurchased());
  }, []);

  const setRemoveAds = useCallback((value: boolean) => {
    setRemoveAdsState(value);
  }, []);

  const setThemeId = useCallback(async (id: ThemeId) => {
    setThemeIdState(id);
    await persistThemeId(id);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      await requestAttPermission();
      if (!mounted) return;
      setAttResolved(true);

      const [adsRemoved, savedTheme] = await Promise.all([
        getRemoveAdsPurchased(),
        getThemeId(),
        initPurchases(),
      ]);

      if (!mounted) return;
      setRemoveAdsState(adsRemoved);
      if (savedTheme) {
        setThemeIdState(savedTheme as ThemeId);
      }

      const asked = await getNotificationsAsked();
      if (!asked && Platform.OS !== 'web') {
        await new Promise<void>((resolve) => {
          Alert.alert(
            'Stay Connected',
            'Allow notifications to receive optional daily Bible verses at 7 AM Pacific and manage alerts in your device Settings.',
            [
              {
                text: 'Not Now',
                style: 'cancel',
                onPress: () => resolve(),
              },
              {
                text: 'Allow',
                onPress: async () => {
                  await requestNotificationPermission();
                  resolve();
                },
              },
            ],
            { cancelable: false }
          );
        });
        await setNotificationsAsked();
      }
      await syncDailyVerseFromStorage();

      await recordAppVisit();
      if (mounted) {
        setIsReady(true);
        void maybePromptRateApp();
      }
    }

    void bootstrap();
    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      isReady,
      attResolved,
      removeAds,
      themeId,
      setThemeId,
      refreshRemoveAds,
      setRemoveAds,
    }),
    [isReady, attResolved, removeAds, themeId, setThemeId, refreshRemoveAds, setRemoveAds]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within AppProvider');
  }
  return ctx;
}

export function useActiveTheme() {
  const { themeId } = useApp();
  return getThemeById(themeId);
}
