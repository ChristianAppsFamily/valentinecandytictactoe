import { Platform } from 'react-native';
import {
  getTrackingPermissionsAsync,
  requestTrackingPermissionsAsync,
} from 'expo-tracking-transparency';

export type AttStatus = 'undetermined' | 'granted' | 'denied' | 'restricted' | 'unavailable';

export async function requestAttPermission(): Promise<AttStatus> {
  if (Platform.OS !== 'ios') {
    return 'unavailable';
  }

  const current = await getTrackingPermissionsAsync();
  if (current.status !== 'undetermined') {
    return current.status as AttStatus;
  }

  const result = await requestTrackingPermissionsAsync();
  return result.status as AttStatus;
}
