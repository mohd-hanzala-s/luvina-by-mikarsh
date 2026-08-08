package com.mikarsh.luvina

import android.app.Application
import com.mikarsh.luvina.data.datastore.LuvinaDataStore
import com.mikarsh.luvina.platform.notifications.NotificationHelper

/**
 * Luvina Application singleton managing native dependency instances,
 * notification channels, and global initialization.
 */
class LuvinaApplication : Application() {

    lateinit var dataStore: LuvinaDataStore
        private set

    lateinit var notificationHelper: NotificationHelper
        private set

    override fun onCreate() {
        super.onCreate()
        instance = this

        dataStore = LuvinaDataStore(this)
        notificationHelper = NotificationHelper(this)
        notificationHelper.createNotificationChannels()
    }

    companion object {
        lateinit var instance: LuvinaApplication
            private set
    }
}
