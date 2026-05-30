import { AppProvider, useApp } from '@/contexts/AppContext';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

function BootstrapGate({ children }: { children: React.ReactNode }) {
  const { isReady, attResolved } = useApp();

  useEffect(() => {
    if (!isReady || !attResolved) {
      return;
    }

    async function onReady() {
      if (Platform.OS !== 'web') {
        try {
          const mobileAds = (await import('react-native-google-mobile-ads')).default;
          await mobileAds().initialize();
        } catch {
          // Ads SDK unavailable in Expo Go without dev build
        }
      }
      await SplashScreen.hideAsync();
    }

    void onReady();
  }, [isReady, attResolved]);

  if (!isReady || !attResolved) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#8B0000" />
      </View>
    );
  }

  return <>{children}</>;
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppProvider>
          <BootstrapGate>
            <RootLayoutNav />
          </BootstrapGate>
        </AppProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFB6C1',
  },
});
