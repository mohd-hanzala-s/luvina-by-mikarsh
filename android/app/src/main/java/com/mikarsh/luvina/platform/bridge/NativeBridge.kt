package com.mikarsh.luvina.platform.bridge

import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.webkit.JavascriptInterface
import android.widget.Toast
import androidx.work.Data
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import com.mikarsh.luvina.platform.notifications.ReminderNotificationWorker
import java.util.concurrent.TimeUnit

/**
 * Bi-directional native JavaScript bridge exposed as `window.LuvinaNative` inside WebView.
 */
class NativeBridge(private val context: Context) {

    @JavascriptInterface
    fun getAppVersion(): String = "1.0.0"

    @JavascriptInterface
    fun isAndroidShell(): Boolean = true

    @JavascriptInterface
    fun performHaptic(): Boolean {
        try {
            val vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val manager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
                manager.defaultVibrator
            } else {
                @Suppress("DEPRECATION")
                context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
            }

            if (vibrator.hasVibrator()) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator.vibrate(VibrationEffect.createOneShot(35L, VibrationEffect.DEFAULT_AMPLITUDE))
                } else {
                    @Suppress("DEPRECATION")
                    vibrator.vibrate(35L)
                }
                return true
            }
        } catch (_: Exception) {
            // Fail silently if vibration unavailable
        }
        return false
    }

    @JavascriptInterface
    fun showToast(message: String) {
        android.os.Handler(android.os.Looper.getMainLooper()).post {
            Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
        }
    }

    @JavascriptInterface
    fun scheduleReminder(id: Int, title: String, body: String, delaySeconds: Long) {
        if (delaySeconds <= 0) return

        val inputData = Data.Builder()
            .putInt("KEY_ID", id)
            .putString("KEY_TITLE", title)
            .putString("KEY_MESSAGE", body)
            .build()

        val request = OneTimeWorkRequestBuilder<ReminderNotificationWorker>()
            .setInitialDelay(delaySeconds, TimeUnit.SECONDS)
            .setInputData(inputData)
            .addTag("reminder_$id")
            .build()

        WorkManager.getInstance(context).enqueue(request)
    }

    @JavascriptInterface
    fun cancelReminder(id: Int) {
        WorkManager.getInstance(context).cancelAllWorkByTag("reminder_$id")
    }
}
