package com.mikarsh.luvina.domain.model

/**
 * Native Android application version metadata.
 */
data class AppVersion(
    val versionName: String,
    val versionCode: Int,
    val isAndroidShell: Boolean = true
)

/**
 * Scheduled background reminder item.
 */
data class ScheduledReminder(
    val id: String,
    val title: String,
    val body: String,
    val triggerTimeMs: Long,
    val type: String = "general"
)
