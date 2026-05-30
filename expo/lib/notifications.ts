import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { DAILY_VERSE_NOTIFICATION_ID } from '@/constants/app';
import { getDailyVerseEnabled, setDailyVerseEnabled } from '@/lib/storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const DAILY_VERSES = [
  'Love is patient, love is kind. — 1 Corinthians 13:4',
  'Above all, love each other deeply. — 1 Peter 4:8',
  'Let all that you do be done in love. — 1 Corinthians 16:14',
  'We love because He first loved us. — 1 John 4:19',
  'And now these three remain: faith, hope and love. — 1 Corinthians 13:13',
  'Be completely humble and gentle; be patient, bearing with one another in love. — Ephesians 4:2',
  'Dear friends, let us love one another, for love comes from God. — 1 John 4:7',
];

function verseForDay(): string {
  const day = Math.floor(Date.now() / 86400000);
  return DAILY_VERSES[day % DAILY_VERSES.length];
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleDailyVerseNotification(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(DAILY_VERSE_NOTIFICATION_ID);

  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_VERSE_NOTIFICATION_ID,
    content: {
      title: 'Daily Verse 💕',
      body: verseForDay(),
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour: 7,
      minute: 0,
      repeats: true,
      timezone: 'America/Los_Angeles',
    },
  });
}

export async function cancelDailyVerseNotification(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(DAILY_VERSE_NOTIFICATION_ID);
}

export async function setDailyVerseNotifications(enabled: boolean): Promise<boolean> {
  await setDailyVerseEnabled(enabled);

  if (!enabled) {
    await cancelDailyVerseNotification();
    return true;
  }

  const granted = await requestNotificationPermission();
  if (!granted) {
    await setDailyVerseEnabled(false);
    return false;
  }

  await scheduleDailyVerseNotification();
  return true;
}

export async function syncDailyVerseFromStorage(): Promise<void> {
  const enabled = await getDailyVerseEnabled();
  if (enabled) {
    const granted = await requestNotificationPermission();
    if (granted) {
      await scheduleDailyVerseNotification();
    }
  }
}
