# Castafiore — command runner
# Run `just` or `just --list` to see available recipes.

# Android SDK location (override on the CLI: just android_home=/path build-android)
android_home := env_var_or_default("ANDROID_HOME", env_var("HOME") + "/Android/Sdk")

# Default: show the list of recipes
default:
    @just --list

# Install dependencies
install:
    npm install

# --- Development ---

# Start the app on Android (dev client)
android:
    npm run android

# Start the app for web
web:
    npm run web

# --- Linting ---

# Lint the source files
lint:
    npm run eslint

# --- Local builds (Gradle, no EAS account needed) ---

# Generate the native android/ directory from the Expo config
prebuild:
    ANDROID_HOME="{{android_home}}" ANDROID_SDK_ROOT="{{android_home}}" npx expo prebuild -p android

# Build the Android release APK locally via Gradle (runs prebuild first)
build-android: prebuild
    ANDROID_HOME="{{android_home}}" ANDROID_SDK_ROOT="{{android_home}}" ./android/gradlew -p android assembleRelease
    @echo "APK: android/app/build/outputs/apk/release/app-release.apk"

# Build the Android debug APK locally via Gradle (no signing, faster)
build-android-debug: prebuild
    ANDROID_HOME="{{android_home}}" ANDROID_SDK_ROOT="{{android_home}}" ./android/gradlew -p android assembleDebug
    @echo "APK: android/app/build/outputs/apk/debug/app-debug.apk"

# Export the web build and generate the service worker
build-web:
    npm run export:web

# --- EAS builds (require access to the EAS project) ---

# Build the Android production APK via EAS (local)
build-eas-android:
    npm run export:android

# Build the Google Play variant via EAS (local)
build-eas-google:
    npm run export:google

# Build the development client via EAS (local)
build-eas-dev:
    npm run export:dev
