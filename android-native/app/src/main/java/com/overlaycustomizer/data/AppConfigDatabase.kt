package com.overlaycustomizer.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * AppConfigDatabase — Room database singleton.
 *
 * Version 1: initial schema.
 * To migrate: increment version and add a Migration object to the builder.
 */
@Database(entities = [AppConfig::class], version = 1, exportSchema = true)
abstract class AppConfigDatabase : RoomDatabase() {

    abstract fun appConfigDao(): AppConfigDao

    companion object {
        @Volatile
        private var INSTANCE: AppConfigDatabase? = null

        fun getInstance(context: Context): AppConfigDatabase {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: buildDatabase(context).also { INSTANCE = it }
            }
        }

        private fun buildDatabase(context: Context): AppConfigDatabase {
            return Room.databaseBuilder(
                context.applicationContext,
                AppConfigDatabase::class.java,
                "overlay_customizer.db",
            )
                .addCallback(object : Callback() {
                    override fun onCreate(db: SupportSQLiteDatabase) {
                        super.onCreate(db)
                        // Seed default target apps on first install
                        INSTANCE?.let { database ->
                            CoroutineScope(Dispatchers.IO).launch {
                                database.appConfigDao().insertAll(defaultConfigs())
                            }
                        }
                    }
                })
                .fallbackToDestructiveMigration()
                .build()
        }

        /** Default monitored apps pre-seeded on first launch. */
        private fun defaultConfigs() = listOf(
            AppConfig(
                packageName = "com.whatsapp",
                displayName = "WhatsApp",
                opacity = 0.35f,
                blurRadius = 10,
                isEnabled = true,
            ),
            AppConfig(
                packageName = "com.facebook.orca",
                displayName = "Messenger",
                opacity = 0.35f,
                blurRadius = 10,
                isEnabled = true,
            ),
            AppConfig(
                packageName = "com.instagram.android",
                displayName = "Instagram",
                opacity = 0.35f,
                blurRadius = 12,
                isEnabled = false,
            ),
            AppConfig(
                packageName = "org.telegram.messenger",
                displayName = "Telegram",
                opacity = 0.30f,
                blurRadius = 8,
                isEnabled = false,
            ),
            AppConfig(
                packageName = "com.snapchat.android",
                displayName = "Snapchat",
                opacity = 0.40f,
                blurRadius = 14,
                isEnabled = false,
            ),
        )
    }
}
