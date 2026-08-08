# Luvina Android

Standalone native Android app for Luvina by Mikarsh. The web app is bundled
inside the APK (offline-first, no network or web-hosting dependency) and shown
in a WebView shell with a branded native splash screen.

## Repository layout

```
android/
  app/
    src/main/
      AndroidManifest.xml
      java/com/mikarsh/luvina/MainActivity.kt   # WebView shell + native splash
      assets/www/                               # Bundled web app (generated)
      res/                                      # Launcher icons, splash, themes
  build.gradle.kts
  settings.gradle.kts
  gradle/wrapper/                               # Gradle 8.11.1 wrapper
```

The bundled app in `app/src/main/assets/www/` is generated from the root
Next.js static export by `pnpm android:sync`. It is git-ignored; rebuild it
whenever the web app changes.

## Prerequisites

- JDK 17+
- Android SDK (compile SDK 35). Android Studio bundles both.
- Node.js 20+ and pnpm (only needed to regenerate the bundled web app).

## Building

1. Regenerate the bundled web app (must be run from the repo root):

   ```
   pnpm android:sync
   ```

   This runs `next build` (static export, empty base path) and copies the
   result into `app/src/main/assets/www/`.

2. Build the app. From `android/`:

   ```
   ./gradlew assembleDebug        # debug APK
   ./gradlew assembleRelease      # release APK/AAB (see signing below)
   ```

   Or open `android/` in Android Studio and use Build > Build Bundle(s) / APK(s).

## Running

- The WebView serves the bundled app from local assets via
  `WebViewAssetLoader` (`appassets.androidplatform.net`), so it works offline
  with no server and no Vercel deployment.
- The native splash (logo + name + tagline) plays once per cold launch; the
  web app detects the `android_shell` marker and skips its own splash.
- Data (settings, logs) is stored in IndexedDB inside the app's private data,
  so it persists across launches and restarts.

## Release signing

Generate a keystore (never commit it):

```
keytool -genkey -v -keystore luvina.keystore -alias luvina \
        -keyalg RSA -keysize 2048 -validity 10000 \
        -dname "CN=Luvina" -storepass CHANGEME -keypass CHANGEME
```

Then uncomment and point `signingConfig` in `app/build.gradle.kts` at it:

```
signingConfigs {
    create("release") {
        storeFile = file("../luvina.keystore")
        storePassword = "..."
        keyAlias = "luvina"
        keyPassword = "..."
    }
}
```

and set `signingConfig = signingConfigs.getByName("release")` in the
`release` build type.

## Icon regeneration

Launcher icons (all densities + adaptive), and the splash mark are generated
from `scripts/assets/luvina-mark-source.png`:

```
pnpm icons:android
```

## Notes

- `app/src/main/res/xml/asset_statements.xml` is intentionally empty: this is
  not a Trusted Web Activity, so no Digital Asset Links are required.
- INTERNET permission is declared only so out-of-app links (Help, OAuth) open
  in the system browser. The app itself never fetches content from the network.
