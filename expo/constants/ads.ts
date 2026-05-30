/**
 * Test builds: keep USE_TEST_ADS true (Google test unit IDs).
 * Production / store submission: set to false or gate with __DEV__ only — never ship with true.
 */
export const USE_TEST_ADS = true;

const TEST_IDS = {
  ios: {
    appId: 'ca-app-pub-3940256099942544~1458002511',
    banner: 'ca-app-pub-3940256099942544/2934735716',
    interstitial: 'ca-app-pub-3940256099942544/4411468910',
  },
  android: {
    appId: 'ca-app-pub-3940256099942544~3347511713',
    banner: 'ca-app-pub-3940256099942544/6300978111',
    interstitial: 'ca-app-pub-3940256099942544/1033173712',
  },
};

const PRODUCTION_IDS = {
  ios: {
    appId: 'ca-app-pub-3002325591150738~9833565606',
    banner: 'ca-app-pub-3002325591150738/2310298801',
    interstitial: 'ca-app-pub-3002325591150738/9212334123',
  },
  android: {
    appId: 'ca-app-pub-3002325591150738~9355274122',
    banner: 'ca-app-pub-3002325591150738/6977053028',
    interstitial: 'ca-app-pub-3002325591150738/5033415964',
  },
};

const ids = USE_TEST_ADS ? TEST_IDS : PRODUCTION_IDS;

export const ADMOB_IDS = ids;
