package com.overlaycustomizer

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.Settings
import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.navigation.findNavController
import androidx.navigation.ui.setupWithNavController
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.overlaycustomizer.databinding.ActivityMainBinding
import com.overlaycustomizer.service.OverlayService

/**
 * MainActivity — entry point.
 *
 * Hosts the bottom nav and the NavController. Each destination is a Fragment:
 *   - HomeFragment       (/home)
 *   - AppsFragment       (/apps)
 *   - ScheduleFragment   (/schedule)
 *   - SettingsFragment   (/settings)
 *
 * On first launch it checks overlay permission and prompts the user if missing.
 */
class MainActivity : AppCompatActivity() {

    companion object {
        private const val TAG = "MainActivity"
        private const val REQ_OVERLAY = 1001
    }

    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val navController = findNavController(R.id.nav_host_fragment)
        binding.bottomNavView.setupWithNavController(navController)

        checkOverlayPermission()
    }

    /**
     * Check SYSTEM_ALERT_WINDOW permission.
     * If not granted, open the system settings page for the user to grant it.
     */
    private fun checkOverlayPermission() {
        if (!Settings.canDrawOverlays(this)) {
            Log.w(TAG, "Overlay permission not granted — redirecting to Settings")
            Toast.makeText(this, "Please grant 'Draw over apps' permission", Toast.LENGTH_LONG).show()
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:$packageName"),
            )
            startActivityForResult(intent, REQ_OVERLAY)
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == REQ_OVERLAY) {
            if (Settings.canDrawOverlays(this)) {
                Log.d(TAG, "Overlay permission granted")
                Toast.makeText(this, "Overlay permission granted!", Toast.LENGTH_SHORT).show()
            } else {
                Log.w(TAG, "Overlay permission denied by user")
                Toast.makeText(
                    this,
                    "Overlay permission is required for background images",
                    Toast.LENGTH_SHORT,
                ).show()
            }
        }
    }

    /** Start (or stop) the foreground OverlayService. */
    fun toggleService(start: Boolean) {
        val intent = Intent(this, OverlayService::class.java)
        if (start) startForegroundService(intent) else stopService(intent)
    }
}
