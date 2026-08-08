package com.mikarsh.luvina.platform

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.RemoteViews
import com.mikarsh.luvina.R
import com.mikarsh.luvina.presentation.main.MainActivity

/**
 * Luvina Aura 2x2 Adaptive Home-Screen Widget Provider.
 * Provides 3 primary quick-access actions:
 * 1. 🌸 Check In -> Opens today's check-in screen
 * 2. 🛡️ Aura -> Opens Aura Emergency Safety Screen
 * 3. 📅 Today -> Opens Cycle Dashboard with current status
 */
class LuvinaAuraWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {
        fun updateAppWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            val views = RemoteViews(context.packageName, R.layout.widget_luvina_aura)

            // Action 1: Check In Intent (opens MainActivity with action 'checkin')
            val checkInIntent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                data = Uri.parse("luvina://checkin")
                putExtra("action", "checkin")
            }
            val checkInPendingIntent = PendingIntent.getActivity(
                context, 101, checkInIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.btn_widget_checkin, checkInPendingIntent)

            // Action 2: Aura SOS Intent (opens MainActivity at /aura)
            val auraIntent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                data = Uri.parse("luvina://aura")
                putExtra("action", "aura")
            }
            val auraPendingIntent = PendingIntent.getActivity(
                context, 102, auraIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.btn_widget_aura, auraPendingIntent)

            // Action 3: Today Dashboard Intent (opens MainActivity home)
            val todayIntent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                data = Uri.parse("luvina://today")
                putExtra("action", "today")
            }
            val todayPendingIntent = PendingIntent.getActivity(
                context, 103, todayIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.btn_widget_today, todayPendingIntent)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
