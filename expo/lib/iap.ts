import { Platform } from 'react-native';
import { REMOVE_ADS_PRODUCT_ID } from '@/constants/app';
import {
  getRemoveAdsPurchased,
  setRemoveAdsPurchased,
} from '@/lib/storage';

export async function initPurchases(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    const iap = await import('expo-iap');
    await iap.initConnection();

    if (await getRemoveAdsPurchased()) {
      return;
    }

    const purchases = await iap.getAvailablePurchases();
    const ownsRemoveAds = purchases.some(
      (p) => p.productId === REMOVE_ADS_PRODUCT_ID
    );
    if (ownsRemoveAds) {
      await setRemoveAdsPurchased(true);
    }
  } catch (e) {
    console.warn('IAP init:', e);
  }
}

export async function purchaseRemoveAds(): Promise<{
  success: boolean;
  message?: string;
}> {
  if (await getRemoveAdsPurchased()) {
    return { success: true, message: 'Ads are already removed.' };
  }

  if (Platform.OS === 'web') {
    return {
      success: false,
      message: 'In-app purchases are only available on iOS and Android devices.',
    };
  }

  try {
    const iap = await import('expo-iap');
    await iap.initConnection();

    const products = await iap.fetchProducts({
      skus: [REMOVE_ADS_PRODUCT_ID],
      type: 'in-app',
    });

    if (!products?.length) {
      return {
        success: false,
        message:
          'Remove Ads is not available yet. Configure the product in App Store Connect.',
      };
    }

    await iap.requestPurchase({
      request: {
        ios: { sku: REMOVE_ADS_PRODUCT_ID },
        android: { skus: [REMOVE_ADS_PRODUCT_ID] },
      },
      type: 'in-app',
    });

    await setRemoveAdsPurchased(true);
    return { success: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Purchase failed.';
    if (msg.toLowerCase().includes('cancel')) {
      return { success: false, message: 'Purchase cancelled.' };
    }
    return { success: false, message: msg };
  }
}

export async function restorePurchases(): Promise<{
  success: boolean;
  message: string;
}> {
  if (Platform.OS === 'web') {
    return {
      success: false,
      message: 'Restore is only available on iOS and Android devices.',
    };
  }

  try {
    const iap = await import('expo-iap');
    await iap.initConnection();
    await iap.restorePurchases();
    const purchases = await iap.getAvailablePurchases();
    const ownsRemoveAds = purchases.some(
      (p: { productId: string }) => p.productId === REMOVE_ADS_PRODUCT_ID
    );
    if (ownsRemoveAds) {
      await setRemoveAdsPurchased(true);
      return { success: true, message: 'Remove Ads restored successfully.' };
    }
    return { success: false, message: 'No previous purchases found.' };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Restore failed.';
    return { success: false, message: msg };
  }
}
