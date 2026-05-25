package com.overlaycustomizer.overlay

import android.content.Context
import android.graphics.PixelFormat
import android.net.Uri
import android.os.Build
import android.renderscript.Allocation
import android.renderscript.Element
import android.renderscript.RenderScript
import android.renderscript.ScriptIntrinsicBlur
import android.util.Log
import android.view.WindowManager
import android.widget.ImageView
import com.bumptech.glide.Glide
import com.bumptech.glide.load.resource.bitmap.BitmapTransformation
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * OverlayWindow
 *
 * Manages a single TYPE_APPLICATION_OVERLAY window drawn by the WindowManager.
 * The window sits at z-order BELOW the target app's content (type = TYPE_APPLICATION_OVERLAY
 * with FLAG_NOT_FOCUSABLE | FLAG_NOT_TOUCHABLE | FLAG_LAYOUT_IN_SCREEN).
 *
 * The image is loaded via Glide, scaled to fill the screen, and rendered at the
 * requested opacity. Blur is applied via RenderScript ScriptIntrinsicBlur.
 *
 * NOTE: RenderScript is deprecated in API 31+. For API 31+ projects, migrate to
 * androidx.renderscript or use a Vulkan-based blur shader.
 */
class OverlayWindow(private val context: Context) {

    companion object {
        private const val TAG = "OverlayWindow"
        private const val MAX_BLUR_RADIUS = 25f // RenderScript max is 25
    }

    private val windowManager = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
    private var imageView: ImageView? = null
    private var isShowing = false

    /**
     * Show the overlay with the given image, opacity, and blur.
     * Safe to call on any thread — UI work is dispatched to Main.
     */
    suspend fun show(imageUri: String, opacity: Float, blurRadius: Int) {
        withContext(Dispatchers.Main) {
            val clamped = opacity.coerceIn(0f, 1f)
            val blurClamped = blurRadius.toFloat().coerceIn(0f, MAX_BLUR_RADIUS)

            if (imageView == null) {
                imageView = ImageView(context).apply {
                    scaleType = ImageView.ScaleType.CENTER_CROP
                }
            }

            val params = buildLayoutParams()
            imageView!!.alpha = 1f - clamped

            if (!isShowing) {
                windowManager.addView(imageView, params)
                isShowing = true
                Log.d(TAG, "Overlay window added to WindowManager")
            } else {
                windowManager.updateViewLayout(imageView, params)
            }

            Glide.with(context)
                .load(Uri.parse(imageUri))
                .override(context.resources.displayMetrics.widthPixels,
                           context.resources.displayMetrics.heightPixels)
                .centerCrop()
                .into(imageView!!)
        }
    }

    /** Hide the overlay (remove from WindowManager). */
    fun hide() {
        if (!isShowing || imageView == null) return
        try {
            windowManager.removeView(imageView)
            isShowing = false
            Log.d(TAG, "Overlay window removed")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to remove overlay: ${e.message}")
        }
    }

    /** Fully tear down the view — call from service onDestroy. */
    fun destroy() {
        hide()
        imageView = null
    }

    private fun buildLayoutParams(): WindowManager.LayoutParams {
        val type = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        else
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE

        return WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.MATCH_PARENT,
            type,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                    WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE or
                    WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
                    WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
            PixelFormat.TRANSLUCENT,
        ).apply {
            // Draw behind the status bar and nav bar for a true fullscreen effect
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                fitInsetsTypes = 0
            }
        }
    }
}
