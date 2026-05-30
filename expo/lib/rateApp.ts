import * as StoreReview from 'expo-store-review';
import { Alert, Linking, Platform } from 'react-native';
import {
  getHasRated,
  getVisitCount,
  incrementVisitCount,
  setHasRated,
} from '@/lib/storage';

const APP_STORE_ID = '0000000000';

export async function recordAppVisit(): Promise<void> {
  await incrementVisitCount();
}

export async function maybePromptRateApp(): Promise<void> {
  if (await getHasRated()) {
    return;
  }

  const visits = await getVisitCount();
  if (visits < 3) {
    return;
  }

  if (visits !== 3 && visits % 3 !== 0) {
    return;
  }

  const canNative = await StoreReview.isAvailableAsync();
  if (canNative) {
    Alert.alert(
      'Enjoying the game?',
      'Would you mind rating Tic Tac Toe: Valentines Day on the App Store?',
      [
        { text: 'Not Now', style: 'cancel' },
        {
          text: 'Rate App',
          onPress: async () => {
            await StoreReview.requestReview();
            await setHasRated();
          },
        },
      ]
    );
    return;
  }

  if (Platform.OS === 'ios') {
    Alert.alert(
      'Rate This App',
      'Thank you for playing! Tap Rate App to leave a review.',
      [
        { text: 'Not Now', style: 'cancel' },
        {
          text: 'Rate App',
          onPress: async () => {
            await Linking.openURL(
              `https://apps.apple.com/app/id${APP_STORE_ID}?action=write-review`
            );
            await setHasRated();
          },
        },
      ]
    );
  }
}
