package com.overlaycustomizer.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import com.overlaycustomizer.data.AppConfigDatabase
import com.overlaycustomizer.service.OverlayService
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * BootReceiver
 *
 * Receives BOOT_COMPLETED to restart the overlay foreground service after a
 * device reboot. Without this, the service would only restart when the user
 * manually opens the app.
 *
 * The service is only restarted if at least one app config has isEnabled = true,
 * so users who deliberately stopped the service won't have it auto-start.
 */
class BootReceiver : BroadcastReceiver() {

    companion object {
        private const val TAG = "BootReceiver"
    }

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Intent.ACTION_BOOT_COMPLETED) return

        Log.d(TAG, "Boot completed — checking if service should restart")

        CoroutineScope(Dispatchers.IO).launch {
            val db = AppConfigDatabase.getInstance(context)
            val hasEnabled = db.appConfigDao().getAll().any { it.isEnabled }

            if (hasEnabled) {
                Log.d(TAG, "Enabled configs found — starting OverlayService")
                val serviceIntent = Intent(context, OverlayService::class.java)
                context.startForegroundService(serviceIntent)
            } else {
                Log.d(TAG, "No enabled configs — skipping service start")
            }
        }
    }
}
