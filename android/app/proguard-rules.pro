# Luvina R8 / ProGuard release rules.

# Preserve JavaScript interface methods for WebView bridge (window.LuvinaNative)
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Preserve ViewBinding classes
-keepclassmembers class * implements androidx.viewbinding.ViewBinding {
    public static *** inflate(...);
    public static *** bind(...);
}

# Preserve WorkManager ListenableWorker constructors for background tasks
-keep class * extends androidx.work.ListenableWorker {
    public <init>(...);
}
