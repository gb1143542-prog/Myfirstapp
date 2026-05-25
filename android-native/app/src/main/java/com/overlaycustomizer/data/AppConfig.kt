package com.overlaycustomizer.data

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * AppConfig — Room entity (maps to the "app_configs" table).
 *
 * Each row stores the overlay settings for one monitored app.
 * The packageName is the unique identifier (e.g. "com.whatsapp").
 */
@Entity(tableName = "app_configs")
data class AppConfig(
    @PrimaryKey
    @ColumnInfo(name = "package_name")
    val packageName: String,

    @ColumnInfo(name = "display_name")
    val displayName: String,

    /** URI string of the chosen background image (null = no image set). */
    @ColumnInfo(name = "image_uri")
    val imageUri: String? = null,

    /**
     * Overlay opacity: 0.0 = fully transparent (image fully visible),
     * 1.0 = fully opaque (image fully hidden behind solid colour).
     * Store the DIMMING amount, not the image alpha.
     */
    @ColumnInfo(name = "opacity")
    val opacity: Float = 0.35f,

    /** Blur radius in px (0–25). Applied via RenderScript / GPU blur. */
    @ColumnInfo(name = "blur_radius")
    val blurRadius: Int = 10,

    /** Whether this app's overlay is currently active. */
    @ColumnInfo(name = "is_enabled")
    val isEnabled: Boolean = true,

    /** Timestamp (epoch ms) of when the config was last changed. */
    @ColumnInfo(name = "updated_at")
    val updatedAt: Long = System.currentTimeMillis(),
)
