# Building an APK for Demo - WebTrader Android App

This guide will walk you through the process of building an APK for your WebTrader Android app using the local Expo build process.

## Prerequisites

Before proceeding, ensure you have the following installed:

- Node.js and npm (or yarn)
- Java Development Kit (JDK) 11 or newer
- Android Studio with Android SDK
- Android SDK Build-Tools
- Expo CLI (`npm install -g expo-cli`)

## Step 1: Install Dependencies

First, make sure all dependencies are installed:

```bash
npm install
# or
yarn install
```

## Step 2: Install Dependencies with Legacy Peer Deps

Since there are some dependency conflicts with newer React type definitions, use the following command to install dependencies:

```bash
npm install --legacy-peer-deps
```

Then install the Expo Development Client with the same flag:

```bash
npm install --save expo-dev-client --legacy-peer-deps
```

Alternatively, you can use the new Expo CLI format:

```bash
npx expo install expo-dev-client
```

## Step 3: Configure Environment

The app is already configured to use different API endpoints based on the environment:

- Development: `http://10.0.2.2:3000` (Android emulator pointing to localhost)
- Staging: `https://staging-api.yourwebsite.com`
- Production: `https://api.yourwebsite.com`

You can modify these endpoints in `src/config/apiConfig.ts` if needed.

## Step 4: Generate Native Projects

Use the new Expo CLI format to generate native projects:

```bash
npx expo prebuild
```

If you encounter any issues, try with the legacy peer deps flag:

```bash
NODE_OPTIONS=--legacy-peer-deps npx expo prebuild
```

This command will create the native Android and iOS projects in the `android` and `ios` directories.

## Step 5: Build the Debug APK

Navigate to the Android project directory:

```bash
cd android
```

Build the debug APK:

```bash
./gradlew assembleDebug
```

If you encounter permission issues on Windows, try:

```bash
gradlew.bat assembleDebug
```

The APK will be available at:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

## Step 6: Build the Release APK (Optional)

For a release version (optimized and signed):

```bash
./gradlew assembleRelease
```

Note: This requires setting up a signing key in `android/app/build.gradle`.

## Alternative: Direct Build Without Expo

If you're encountering issues with the Expo build process, you can use a more direct approach:

1. Make sure you have Android Studio installed with the Android SDK.

2. Create a standard React Native project:

```bash
npx react-native init WebTraderApp --template react-native-template-typescript
```

3. Copy your source files to the new project:
   - Copy the `src` directory to the new project
   - Update the imports in `App.tsx` to point to your components
   - Copy over any necessary configuration files

4. Build the APK directly:

```bash
cd WebTraderApp/android
./gradlew assembleDebug
```

The APK will be available at `WebTraderApp/android/app/build/outputs/apk/debug/app-debug.apk`

## Alternative: Using Expo Application Services (EAS)

If you have an Expo account and want to use their cloud build service:

1. Install EAS CLI:

```bash
npm install -g eas-cli
```

2. Log in to your Expo account:

```bash
eas login
```

3. Build the APK with legacy peer deps flag:

```bash
NODE_OPTIONS=--legacy-peer-deps eas build -p android --profile preview
```

## Installing the APK on Android Devices

1. Transfer the APK file to the Android device using:
   - USB cable
   - Email
   - Cloud storage (Google Drive, Dropbox, etc.)

2. On the Android device, navigate to the APK file using a file manager.

3. Tap the APK file to start the installation.

4. If prompted, enable "Install from Unknown Sources" in your device settings.

## Demo Setup Tips

1. **Test Accounts**: Use these credentials for demo purposes:
   - Regular User: `demo@webtrader.com` / `demo1234`
   - Premium User: `premium@webtrader.com` / `premium1234`

2. **Network Connectivity**: The app includes offline capabilities through caching. To demonstrate:
   - Use the app normally with internet connection
   - Enable airplane mode to show offline functionality
   - Re-enable internet to show synchronization

3. **Features to Showcase**:
   - Authentication flow
   - Portfolio management
   - Social feed with posting and commenting
   - Subscription management
   - Research reports and market data

4. **Performance Optimization**:
   - The app uses caching for better performance
   - API responses are cached based on their volatility
   - UI is optimized for both light and dark themes

## Troubleshooting

1. **Build Errors**:
   - Ensure Android SDK and JDK are properly configured
   - Check that all dependencies are installed
   - Verify that the Android SDK Build-Tools are installed

2. **Runtime Errors**:
   - Check API endpoint configuration
   - Verify network connectivity
   - Check console logs for detailed error information

3. **API Connection Issues**:
   - Ensure the backend server is running
   - Verify API endpoints in `src/config/apiConfig.ts`
   - Check for CORS issues if testing with local backend

## Support

For any issues or questions, please contact the development team.
