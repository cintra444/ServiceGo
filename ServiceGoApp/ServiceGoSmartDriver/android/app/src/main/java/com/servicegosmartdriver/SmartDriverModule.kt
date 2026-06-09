package com.servicegosmartdriver

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

class SmartDriverModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "SmartDriverModule"

    @ReactMethod
    fun startObserving(promise: Promise) {
        SmartAccessibilityService.setObservationEnabled(true)
        promise.resolve(null)
    }

    @ReactMethod
    fun stopObserving(promise: Promise) {
        SmartAccessibilityService.setObservationEnabled(false)
        promise.resolve(null)
    }

    @ReactMethod
    fun showOverlay(message: String, promise: Promise) {
        val intent = Intent(reactContext, OverlayService::class.java).apply {
            action = OverlayService.ACTION_SHOW
            putExtra(OverlayService.EXTRA_MESSAGE, message)
        }
        startService(intent)
        promise.resolve(null)
    }

    @ReactMethod
    fun hideOverlay(promise: Promise) {
        val intent = Intent(reactContext, OverlayService::class.java).apply {
            action = OverlayService.ACTION_HIDE
        }
        startService(intent)
        promise.resolve(null)
    }

    @ReactMethod
    fun openAccessibilitySettings(promise: Promise) {
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        reactContext.startActivity(intent)
        promise.resolve(null)
    }

    @ReactMethod
    fun openOverlaySettings(promise: Promise) {
        val intent =
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:${reactContext.packageName}")
                )
            } else {
                Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                    data = Uri.parse("package:${reactContext.packageName}")
                }
            }

        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        reactContext.startActivity(intent)
        promise.resolve(null)
    }

    @ReactMethod
    fun addListener(eventName: String) = Unit

    @ReactMethod
    fun removeListeners(count: Int) = Unit

    fun emitSnapshot(snapshot: AccessibilitySnapshot) {
        val payload = Arguments.createMap().apply {
            putString("packageName", snapshot.packageName)
            putString("eventType", snapshot.eventType)
            putString("capturedAt", snapshot.capturedAt)
            putString("combinedText", snapshot.combinedText)

            val nodes = Arguments.createArray()
            snapshot.nodes.forEach { node ->
                val item = Arguments.createMap().apply {
                    putString("text", node.text)
                    putString("viewId", node.viewId)
                    putString("className", node.className)
                    putString("contentDescription", node.contentDescription)
                }
                nodes.pushMap(item)
            }
            putArray("nodes", nodes)
        }

        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("SmartDriverSnapshot", payload)
    }

    private fun startService(intent: Intent) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            reactContext.startForegroundService(intent)
        } else {
            reactContext.startService(intent)
        }
    }
}
