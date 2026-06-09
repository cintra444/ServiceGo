package com.servicegosmartdriver

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.provider.Settings
import android.view.Gravity
import android.view.WindowManager
import android.widget.TextView
import androidx.core.app.NotificationCompat

class OverlayService : Service() {
    private var windowManager: WindowManager? = null
    private var overlayView: TextView? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
        createNotificationChannel()
        startForeground(NOTIFICATION_ID, buildNotification())
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_SHOW -> showOverlay(intent.getStringExtra(EXTRA_MESSAGE) ?: "NAO ACEITAR")
            ACTION_HIDE -> hideOverlay()
        }
        return START_STICKY
    }

    override fun onDestroy() {
        hideOverlay()
        super.onDestroy()
    }

    private fun showOverlay(message: String) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
            return
        }

        val existingView = overlayView
        if (existingView != null) {
            existingView.text = message
            return
        }

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            } else {
                @Suppress("DEPRECATION")
                WindowManager.LayoutParams.TYPE_PHONE
            },
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE or
                WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP
            y = 80
        }

        overlayView = TextView(this).apply {
            text = message
            setBackgroundColor(Color.parseColor("#DC2626"))
            setTextColor(Color.WHITE)
            textSize = 28f
            gravity = Gravity.CENTER
            setPadding(24, 32, 24, 32)
        }

        windowManager?.addView(overlayView, params)
    }

    private fun hideOverlay() {
        overlayView?.let { view ->
            windowManager?.removeView(view)
        }
        overlayView = null
    }

    private fun buildNotification(): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("ServiceGo Smart Driver")
            .setContentText("Overlay de alerta pronto para uso.")
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .setOngoing(true)
            .build()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return
        }

        val channel = NotificationChannel(
            CHANNEL_ID,
            "Smart Driver Overlay",
            NotificationManager.IMPORTANCE_LOW
        )
        val manager = getSystemService(NotificationManager::class.java)
        manager.createNotificationChannel(channel)
    }

    companion object {
        const val ACTION_SHOW = "com.servicegosmartdriver.overlay.SHOW"
        const val ACTION_HIDE = "com.servicegosmartdriver.overlay.HIDE"
        const val EXTRA_MESSAGE = "extra_message"

        private const val CHANNEL_ID = "smart_driver_overlay"
        private const val NOTIFICATION_ID = 3011
    }
}
