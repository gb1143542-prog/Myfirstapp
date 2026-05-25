# Overlay Customizer — Native Android (Kotlin)

Complete native Android architecture for Overlay Customizer. Open in Android Studio.

## Architecture Overview

```
android-native/
├── app/
│   ├── build.gradle                          # App-level Gradle config
│   └── src/main/
│       ├── AndroidManifest.xml               # All permissions + service declarations
│       └── java/com/overlaycustomizer/
│           ├── MainActivity.kt               # Entry point, permission check, BottomNav
│           ├── data/
│           │   ├── AppConfig.kt              # Room entity — overlay settings per app
│           │   ├── AppConfigDao.kt           # Room DAO — CRUD + Flow queries
│           │   └── AppConfigDatabase.kt      # Room singleton + seed data
│           ├── overlay/
│           │   └── OverlayWindow.kt          # TYPE_APPLICATION_OVERLAY window manager
│           ├── receiver/
│           │   └── BootReceiver.kt           # Auto-restart service after device reboot
│           ├── scheduler/
│           │   └── BackgroundChanger.kt      # WorkManager job — rotate images on timer
│           ├── service/
│           │   ├── AppMonitorAccessibilityService.kt  # Detects foreground app changes
│           │   └── OverlayService.kt         # Foreground service — manages overlay window
│           └── tile/
│               └── QuickSettingsTile.kt      # Quick Settings panel toggle
├── build.gradle                              # Project-level Gradle
└── settings.gradle                           # Module includes
```

## How It Works

### 1. App Detection (Accessibility Service)
`AppMonitorAccessibilityService` listens for `TYPE_WINDOW_STATE_CHANGED` events. When a new package enters the foreground it queries Room for that package's config and sends an intent to `OverlayService`.

### 2. Overlay Display (Foreground Service + WindowManager)
`OverlayService` runs as a persistent foreground service with a status-bar notification. It owns the `OverlayWindow` instance which draws a `TYPE_APPLICATION_OVERLAY` window using Android's `WindowManager`. The image is loaded via Glide, scaled to fill the screen, and rendered at the configured opacity.

### 3. Local Database (Room + SQLite)
`AppConfigDatabase` stores each app's settings in SQLite via Room:
- `package_name` — unique key
- `image_uri` — local content URI of the chosen photo
- `opacity` — dim amount (0.0–1.0)
- `blur_radius` — RenderScript blur (0–25 px)
- `is_enabled` — whether the overlay is active for this app

### 4. Auto-Change Scheduler (WorkManager)
`BackgroundChanger` is a `PeriodicWorkRequest` that fires every N hours. It cycles through stored favourites and calls `AppConfigDao.updateImageUri()` to rotate the background.

### 5. Quick Settings Tile
`QuickSettingsTile` reflects `OverlayService.isRunning` and sends start/stop intents on tap.

### 6. Boot Persistence
`BootReceiver` starts the service on `BOOT_COMPLETED` if any enabled configs exist.

## Setup Steps (Android Studio)

1. Open `android-native/` as an Android Studio project
2. Sync Gradle (`File → Sync Project with Gradle Files`)
3. Build and run on a physical Android device (API 26+)
4. Grant permissions in the app's onboarding screen:
   - **Draw Over Apps** → Settings → Apps → Special app access → Display over other apps
   - **Accessibility** → Settings → Accessibility → Overlay Customizer Monitor → Enable
   - **Storage / Photos** → granted via system dialog on first gallery pick

## Required Permissions

| Permission | Why |
|---|---|
| `SYSTEM_ALERT_WINDOW` | Draw the overlay window |
| `FOREGROUND_SERVICE` | Run the persistent background service |
| `BIND_ACCESSIBILITY_SERVICE` | Monitor foreground app changes |
| `BIND_QUICK_SETTINGS_TILE` | Add QS panel tile |
| `RECEIVE_BOOT_COMPLETED` | Auto-restart after reboot |
| `READ_MEDIA_IMAGES` (API 33+) | Access gallery for photo selection |
| `READ_EXTERNAL_STORAGE` (API ≤32) | Legacy gallery access |

## Notes

- **RenderScript blur** is deprecated on API 31+. For newer targets, replace `ScriptIntrinsicBlur` with `android:blurRadius` on API 31+ or a custom GPU blur shader (Vulkan / AGSL).
- **Scoped Storage**: use `MediaStore` or `PhotoPicker` (Android 13+) instead of raw file paths. The current `OverlayWindow` already uses `Uri.parse()` which is compatible with content URIs.
- **FLAG_SECURE apps**: apps with `FLAG_SECURE` (banking apps, some DMs) block overlay windows. The overlay silently fails on these apps.
- **MIUI / OneUI / ColorOS**: manufacturer overlays may require additional "Display pop-up windows while running in the background" permissions in the OEM settings app.
