package com.overlaycustomizer.scheduler

import android.content.Context
import android.util.Log
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.Worker
import androidx.work.WorkerParameters
import com.overlaycustomizer.data.AppConfigDatabase
import kotlinx.coroutines.runBlocking
import java.util.concurrent.TimeUnit

/**
 * BackgroundChanger — WorkManager Worker
 *
 * Periodically rotates the background image for all configured apps.
 * Can operate in two modes:
 *   1. TIMER — change after a fixed interval (e.g. every 1 h / 24 h)
 *   2. ALBUM — cycle through a user-selected set of favourites
 *
 * WorkManager guarantees execution even across reboots and is battery-aware
 * (respects Doze mode, battery saver, and Flex intervals).
 *
 * Usage:
 *   BackgroundChanger.schedule(context, intervalHours = 24)
 *   BackgroundChanger.cancel(context)
 */
class BackgroundChanger(
    appContext: Context,
    workerParams: WorkerParameters,
) : Worker(appContext, workerParams) {

    companion object {
        private const val TAG = "BackgroundChanger"
        private const val WORK_TAG = "overlay_bg_changer"

        /**
         * Schedule a periodic rotation.
         * Calling this again replaces the existing schedule (REPLACE policy).
         */
        fun schedule(context: Context, intervalHours: Long) {
            val request = PeriodicWorkRequestBuilder<BackgroundChanger>(
                intervalHours, TimeUnit.HOURS,
                (intervalHours / 4).coerceAtLeast(15), TimeUnit.MINUTES, // flex window
            )
                .setConstraints(
                    Constraints.Builder()
                        .setRequiresBatteryNotLow(false)
                        .build()
                )
                .addTag(WORK_TAG)
                .build()

            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                WORK_TAG,
                ExistingPeriodicWorkPolicy.REPLACE,
                request,
            )
            Log.d(TAG, "Scheduled background changer every $intervalHours hours")
        }

        /** Cancel the periodic rotation. */
        fun cancel(context: Context) {
            WorkManager.getInstance(context).cancelAllWorkByTag(WORK_TAG)
            Log.d(TAG, "Background changer cancelled")
        }
    }

    override fun doWork(): Result {
        Log.d(TAG, "BackgroundChanger doWork started")
        return try {
            runBlocking {
                rotateFavourites()
            }
            Log.d(TAG, "BackgroundChanger doWork success")
            Result.success()
        } catch (e: Exception) {
            Log.e(TAG, "BackgroundChanger doWork failed: ${e.message}")
            Result.retry()
        }
    }

    /**
     * Cycle each configured app's imageUri to the next image in its favourites list.
     *
     * In a full implementation this would read a FavouriteImage table and advance
     * a cursor. For now it logs the intent — wire up to your Favourites DAO.
     */
    private suspend fun rotateFavourites() {
        val db = AppConfigDatabase.getInstance(applicationContext)
        val configs = db.appConfigDao().getConfigured()
        Log.d(TAG, "Rotating images for ${configs.size} configured apps")
        // TODO: implement favourites album lookup and cursor advancement
        // Example: for each config, pick next URI from FavouriteDao, call updateImageUri()
    }
}
