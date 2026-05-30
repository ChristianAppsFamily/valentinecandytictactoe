import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  visitCount: '@tictac/visitCount',
  hasRated: '@tictac/hasRated',
  removeAds: '@tictac/removeAds',
  themeId: '@tictac/themeId',
  dailyVerseEnabled: '@tictac/dailyVerseEnabled',
  notificationsAsked: '@tictac/notificationsAsked',
  attCompleted: '@tictac/attCompleted',
} as const;

export async function getVisitCount(): Promise<number> {
  const v = await AsyncStorage.getItem(KEYS.visitCount);
  return v ? parseInt(v, 10) : 0;
}

export async function incrementVisitCount(): Promise<number> {
  const next = (await getVisitCount()) + 1;
  await AsyncStorage.setItem(KEYS.visitCount, String(next));
  return next;
}

export async function getHasRated(): Promise<boolean> {
  return (await AsyncStorage.getItem(KEYS.hasRated)) === 'true';
}

export async function setHasRated(): Promise<void> {
  await AsyncStorage.setItem(KEYS.hasRated, 'true');
}

export async function getRemoveAdsPurchased(): Promise<boolean> {
  return (await AsyncStorage.getItem(KEYS.removeAds)) === 'true';
}

export async function setRemoveAdsPurchased(value: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.removeAds, value ? 'true' : 'false');
}

export async function getThemeId(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.themeId);
}

export async function setThemeId(id: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.themeId, id);
}

export async function getDailyVerseEnabled(): Promise<boolean> {
  return (await AsyncStorage.getItem(KEYS.dailyVerseEnabled)) === 'true';
}

export async function setDailyVerseEnabled(value: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.dailyVerseEnabled, value ? 'true' : 'false');
}

export async function getNotificationsAsked(): Promise<boolean> {
  return (await AsyncStorage.getItem(KEYS.notificationsAsked)) === 'true';
}

export async function setNotificationsAsked(): Promise<void> {
  await AsyncStorage.setItem(KEYS.notificationsAsked, 'true');
}
