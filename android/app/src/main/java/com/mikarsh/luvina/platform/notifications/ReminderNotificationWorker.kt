package com.mikarsh.luvina.platform.notifications

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters

/**
 * CoroutineWorker executing background reminder notifications reliably via WorkManager.
 */
class ReminderNotificationWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        val title = inputData.getString("KEY_TITLE") ?: "Luvina Reminder"
        val message = inputData.getString("KEY_MESSAGE") ?: "Time for your daily check-in!"
        val notificationId = inputData.getInt("KEY_ID", System.currentTimeMillis().toInt())

        val helper = NotificationHelper(applicationContext)
        helper.showNotification(notificationId, title, message)

        return Result.success()
    }
}
