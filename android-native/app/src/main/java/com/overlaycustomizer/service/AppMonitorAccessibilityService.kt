package com.overlaycustomizer.service

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Intent
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import com.overlaycustomizer.data.AppConfigDatabase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * AppMonitorAccessibilityService
 *
 * Monitors TYPE_WINDOW_STATE_CHANGED events to detect when the user switches
 * to a monitored target app. When a target app enters the foreground the service
 * sends an intent to OverlayService to show/hide the overlay window.
 *
 * Setup: the user must manually enable this service in
 * Settings → Accessibility → Overlay Customizer → Installed services.
 */
class AppMonitorAccessibilityService : AccessibilityService() {

    companion object {
        private const val TAG = "AppMonitorA11y"
        const val ACTION_APP_FOREGROUND = "com.overlaycustomizer.APP_FOREGROUND"
        const val EXTRA_PACKAGE_NAME = "package_name"
        var instance: AppMonitorAccessibilityService? = null
    }

    private val scope = CoroutineScope(Dispatchers.IO)
    private var currentPackage: String? = null

    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = this
        serviceInfo = AccessibilityServiceInfo().apply {
            eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED
            feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
            flags = AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS or
                    AccessibilityServiceInfo.FLAG_INCLUDE_NOT_IMPORTANT_VIEWS
            notificationTimeout = 100
        }
        Log.d(TAG, "Accessibility service connected")
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event?.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return
        val pkg = event.packageName?.toString() ?: return

        // Ignore our own package to prevent recursive overlay on our UI
        if (pkg == applicationContext.packageName) return
        if (pkg == currentPackage) return

        currentPackage = pkg

        scope.launch {
            val db = AppConfigDatabase.getInstance(applicationContext)
            val config = db.appConfigDao().getByPackageName(pkg)

            val overlayIntent = Intent(applicationContext, OverlayService::class.java).apply {
                action = if (config != null && config.isEnabled) {
                    Log.d(TAG, "Target app detected: $pkg — showing overlay")
                    OverlayService.ACTION_SHOW_OVERLAY
                } else {
                    Log.d(TAG, "Non-target app: $pkg — hiding overlay")
                    OverlayService.ACTION_HIDE_OVERLAY
                }
                putExtra(EXTRA_PACKAGE_NAME, pkg)
            }
            applicationContext.startService(overlayIntent)
        }
    }

    override fun onInterrupt() {
        Log.w(TAG, "Accessibility service interrupted")
    }

    override fun onDestroy() {
        super.onDestroy()
        instance = null
    }
}
