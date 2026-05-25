package com.overlaycustomizer.data

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

/**
 * AppConfigDao — Room Data Access Object
 *
 * All suspend functions are safe to call from a coroutine.
 * The Flow<List<AppConfig>> overload emits whenever the table changes —
 * useful for observing from the UI via collectAsStateWithLifecycle().
 */
@Dao
interface AppConfigDao {

    /** Watch all configs as a reactive Flow (emits on every change). */
    @Query("SELECT * FROM app_configs ORDER BY display_name ASC")
    fun getAllFlow(): Flow<List<AppConfig>>

    /** One-shot read of all configs. */
    @Query("SELECT * FROM app_configs ORDER BY display_name ASC")
    suspend fun getAll(): List<AppConfig>

    /** Look up a config by package name (returns null if not found). */
    @Query("SELECT * FROM app_configs WHERE package_name = :packageName LIMIT 1")
    suspend fun getByPackageName(packageName: String): AppConfig?

    /** All configs where isEnabled = true. */
    @Query("SELECT * FROM app_configs WHERE is_enabled = 1")
    fun getEnabledFlow(): Flow<List<AppConfig>>

    /** All configs where an image has been set (image_uri IS NOT NULL). */
    @Query("SELECT * FROM app_configs WHERE image_uri IS NOT NULL")
    suspend fun getConfigured(): List<AppConfig>

    /** Insert or replace a config. Use REPLACE to handle upsert semantics. */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(config: AppConfig)

    /** Insert or replace multiple configs in one transaction. */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(configs: List<AppConfig>)

    /** Update a config that already exists (matched by primary key). */
    @Update
    suspend fun update(config: AppConfig)

    /** Delete a specific config. */
    @Delete
    suspend fun delete(config: AppConfig)

    /** Remove all stored configs (used for reset/wipe). */
    @Query("DELETE FROM app_configs")
    suspend fun deleteAll()

    /** Update just the image URI for a given package. */
    @Query("UPDATE app_configs SET image_uri = :uri, updated_at = :ts WHERE package_name = :pkg")
    suspend fun updateImageUri(pkg: String, uri: String?, ts: Long = System.currentTimeMillis())

    /** Update opacity and blur in a single targeted query. */
    @Query(
        """
        UPDATE app_configs
        SET opacity = :opacity, blur_radius = :blur, updated_at = :ts
        WHERE package_name = :pkg
        """
    )
    suspend fun updateOpacityAndBlur(
        pkg: String,
        opacity: Float,
        blur: Int,
        ts: Long = System.currentTimeMillis(),
    )

    /** Toggle the enabled flag for a given package. */
    @Query("UPDATE app_configs SET is_enabled = :enabled WHERE package_name = :pkg")
    suspend fun setEnabled(pkg: String, enabled: Boolean)
}
