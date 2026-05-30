# Tic Tac Toe: Valentines Day

Christian App Empire LLC — Valentine-themed tic-tac-toe for iOS and Android.

## Local path

Project root:

`/Users/longmorebiz/Desktop/ChristianAppEmpire/valentinecandytictactoe-main`

App source and Expo config live in the `expo/` folder.

## Xcode (test on your iPhone)

1. Install dependencies:

```bash
cd expo
npm install
npx expo prebuild --platform ios
```

2. Open the workspace in Xcode:

```bash
open ios/TicTacToeValentinesDay.xcworkspace
```

Workspace file: `expo/ios/TicTacToeValentinesDay.xcworkspace`

3. Select your iPhone as the run destination, set your Team under Signing & Capabilities, then **Product → Run**.

4. Configure **Remove Ads** in App Store Connect with product ID:

`com.christianappempire.tictactoevalentinesday.removeads`

## Ads (test vs production)

- Test builds: `expo/constants/ads.ts` has `USE_TEST_ADS = true` (Google test units).
- **Never ship store builds with `USE_TEST_ADS = true`.** Set to `false` (or `__DEV__` only) before App Store submission.

## Privacy policy (GitHub Pages)

Publish `docs/privacy-policy.html` as a GitHub Pages site. In-app link:

`https://christianappsfamily.github.io/valentinecandytictactoe/privacy-policy.html`

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Expo dev server |
| `npm run prebuild:ios` | Generate native iOS project |
| `npm run ios` | Build and run on simulator/device |
