package com.overlaycustomizer.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import com.overlaycustomizer.MainActivity
import com.overlaycustomizer.R
import com.overlaycustomizer.data.AppConfigDatabase
import com.overlaycustomizer.overlay.OverlayWindow
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * OverlayService — Foreground Service
 *
 * Runs persistently in the background and manages the system overlay window.
 * Responds to intents from AppMonitorAccessibilityService to show/hide overlays.
 *
 * Why a Foreground Service?
 * Android 8+ restricts background services; a Foreground Service with a
 * persistent notification is the only way to reliably run long-lived work
 * on modern Android without the OS killing the process.
 */
class OverlayService : Service() {

    companion object {
        private const val TAG = "OverlayService"
        private const val NOTIFICATION_ID = 1001
        private const val CHANNEL_ID = "overlay_service_channel"

        const val ACTION_SHOW_OVERLAY = "com.overlaycustomizer.SHOW_OVERLAY"
        const val ACTION_HIDE_OVERLAY = "com.overlaycustomizer.HIDE_OVERLAY"
        const val ACTION_TOGGLE_SERVICE = "com.overlaycustomizer.TOGGLE_SERVICE"
        const val EXTRA_PACKAGE_NAME = "package_name"

        var isRunning = false
    }

    private var overlayWindow: OverlayWindow? = null
    private val scope = CoroutineScope(Dispatchers.Main)

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        isRunning = true
        createNotificationChannel()
        startForeground(NOTIFICATION_ID, buildNotification(false))
        overlayWindow = OverlayWindow(applicationContext)
        Log.d(TAG, "OverlayService created and running in foreground")
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_SHOW_OVERLAY -> {
                val pkg = intent.getStringExtra(EXTRA_PACKAGE_NAME) ?: return START_STICKY
                scope.launch {
                    showOverlayForApp(pkg)
                }
            }
            ACTION_HIDE_OVERLAY -> {
                overlayWindow?.hide()
                updateNotification(false)
            }
            ACTION_TOGGLE_SERVICE -> {
                stopSelf()
            }
        }
        return START_STICKY
    }

    private suspend fun showOverlayForApp(packageName: String) {
        val db = AppConfigDatabase.getInstance(applicationContext)
        val config = db.appConfigDao().getByPackageName(packageName) ?: run {
            overlayWindow?.hide()
            return
        }

        if (!config.isEnabled || config.imageUri == null) {
            overlayWindow?.hide()
            return
        }

        overlayWindow?.show(
            imageUri = config.imageUri!!,
            opacity = config.opacity,
            blurRadius = config.blurRadius,
        )
        updateNotification(true, config.displayName)
        Log.d(TAG, "Overlay shown for $packageName (opacity=${config.opacity}, blur=${config.blurRadius})")
    }

    private fun createNotificationChannel() {
        val channel = NotificationChannel(
            CHANNEL_ID,
            "Overlay Service",
            NotificationManager.IMPORTANCE_LOW,
        ).apply {
            description = "Persistent notification for the overlay background service"
            setShowBadge(false)
        }
        getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
    }

    private fun buildNotification(active: Boolean, appName: String? = null): Notification {
        val openIntent = PendingIntent.getActivity(
            this, 0,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_IMMUTABLE,
        )
        val toggleIntent = PendingIntent.getService(
            this, 1,
            Intent(this, OverlayService::class.java).apply { action = ACTION_TOGGLE_SERVICE },
            PendingIntent.FLAG_IMMUTABLE,
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_overlay_tile)
            .setContentTitle("Overlay Customizer")
            .setContentText(
                if (active && appName != null) "Active on $appName"
                else "Monitoring for target apps…"
            )
            .setContentIntent(openIntent)
            .addAction(R.drawable.ic_overlay_tile, "Stop", toggleIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    private fun updateNotification(active: Boolean, appName: String? = null) {
        getSystemService(NotificationManager::class.java)
            .notify(NOTIFICATION_ID, buildNotification(active, appName))
    }

    override fun onDestroy() {
        super.onDestroy()
        isRunning = false
        overlayWindow?.destroy()
        overlayWindow = null
        Log.d(TAG, "OverlayService destroyed")
    }
}
