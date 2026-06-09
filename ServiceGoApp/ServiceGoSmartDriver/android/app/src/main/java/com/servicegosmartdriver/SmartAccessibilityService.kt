package com.servicegosmartdriver

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import com.facebook.react.ReactApplication
import java.time.Instant

data class AccessibilityNodePayload(
    val text: String,
    val viewId: String?,
    val className: String?,
    val contentDescription: String?
)

data class AccessibilitySnapshot(
    val packageName: String,
    val eventType: String,
    val capturedAt: String,
    val combinedText: String,
    val nodes: List<AccessibilityNodePayload>
)

class SmartAccessibilityService : AccessibilityService() {
    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null || !observationEnabled) {
            return
        }

        val packageName = event.packageName?.toString() ?: return
        if (packageName !in targetPackages) {
            return
        }

        val rootNode = rootInActiveWindow ?: return
        val nodes = mutableListOf<AccessibilityNodePayload>()
        collectVisibleText(rootNode, nodes)

        if (nodes.isEmpty()) {
            return
        }

        val combinedText = nodes.joinToString("\n") { it.text }.trim()
        if (combinedText.isBlank()) {
            return
        }

        val now = System.currentTimeMillis()
        if (combinedText == lastCombinedText && now - lastEmissionAt < SNAPSHOT_DEBOUNCE_MS) {
            return
        }

        lastCombinedText = combinedText
        lastEmissionAt = now

        val snapshot = AccessibilitySnapshot(
            packageName = packageName,
            eventType = eventTypeToName(event.eventType),
            capturedAt = Instant.now().toString(),
            combinedText = combinedText,
            nodes = nodes
        )

        val reactHost = (application as? ReactApplication)?.reactNativeHost ?: return
        val reactContext = reactHost.reactInstanceManager.currentReactContext ?: return
        val module = reactContext.getNativeModule(SmartDriverModule::class.java) ?: return
        module.emitSnapshot(snapshot)
    }

    override fun onInterrupt() = Unit

    private fun collectVisibleText(
        node: AccessibilityNodeInfo?,
        collector: MutableList<AccessibilityNodePayload>
    ) {
        if (node == null) {
            return
        }

        val text = node.text?.toString()?.trim().orEmpty()
        val description = node.contentDescription?.toString()?.trim().orEmpty()
        val resolvedText = listOf(text, description).firstOrNull { it.isNotBlank() }

        if (!resolvedText.isNullOrBlank()) {
            collector += AccessibilityNodePayload(
                text = resolvedText,
                viewId = node.viewIdResourceName,
                className = node.className?.toString(),
                contentDescription = if (description.isBlank()) null else description
            )
        }

        for (index in 0 until node.childCount) {
            collectVisibleText(node.getChild(index), collector)
        }
    }

    private fun eventTypeToName(eventType: Int): String {
        return when (eventType) {
            AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED -> "TYPE_WINDOW_CONTENT_CHANGED"
            AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED -> "TYPE_WINDOW_STATE_CHANGED"
            else -> "TYPE_OTHER"
        }
    }

    companion object {
        private val targetPackages = setOf(
            "com.ubercab.driver",
            "com.taxis99",
            "com.taxis99.driver"
        )

        @Volatile
        private var observationEnabled: Boolean = true

        @Volatile
        private var lastEmissionAt: Long = 0L

        @Volatile
        private var lastCombinedText: String = ""

        private const val SNAPSHOT_DEBOUNCE_MS = 500L

        fun setObservationEnabled(enabled: Boolean) {
            observationEnabled = enabled
        }
    }
}
