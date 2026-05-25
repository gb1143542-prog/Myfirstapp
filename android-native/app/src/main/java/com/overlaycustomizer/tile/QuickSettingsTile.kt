package com.overlaycustomizer.tile

import android.content.Intent
import android.service.quicksettings.Tile
import android.service.quicksettings.TileService
import android.util.Log
import com.overlaycustomizer.service.OverlayService

/**
 * QuickSettingsTile
 *
 * Adds a Quick Settings panel tile that lets the user instantly toggle the
 * overlay service without opening the app.
 *
 * The tile reflects the current service state:
 *   - ACTIVE   → overlay service is running (green/tinted)
 *   - INACTIVE → service stopped (grey)
 *
 * Users add this tile by long-pressing the Quick Settings panel and dragging
 * "Overlay Customizer" into the active tile area.
 *
 * Note: TileService callbacks run on the main thread.
 */
class QuickSettingsTile : TileService() {

    companion object {
        private const val TAG = "QuickSettingsTile"
    }

    /** Called when the tile enters the listening state (panel opened). */
    override fun onStartListening() {
        super.onStartListening()
        updateTile()
    }

    /** Called when the user taps the tile. */
    override fun onClick() {
        super.onClick()
        val isRunning = OverlayService.isRunning

        if (isRunning) {
            // Stop the service
            Log.d(TAG, "Tile tapped — stopping OverlayService")
            val stop = Intent(this, OverlayService::class.java).apply {
                action = OverlayService.ACTION_TOGGLE_SERVICE
            }
            startService(stop)
        } else {
            // Start the service
            Log.d(TAG, "Tile tapped — starting OverlayService")
            val start = Intent(this, OverlayService::class.java)
            startForegroundService(start)
        }

        // Give the service 200 ms to change state before refreshing the tile
        qsTile?.postDelayed({ updateTile() }, 200)
    }

    private fun updateTile() {
        val tile = qsTile ?: return
        val running = OverlayService.isRunning

        tile.state = if (running) Tile.STATE_ACTIVE else Tile.STATE_INACTIVE
        tile.label = "Overlay"
        tile.contentDescription = if (running) "Overlay active — tap to stop" else "Overlay stopped — tap to start"
        tile.updateTile()
        Log.d(TAG, "Tile updated — running=$running")
    }
}
