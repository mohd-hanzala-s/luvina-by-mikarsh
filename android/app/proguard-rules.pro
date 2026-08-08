# Luvina release ProGuard rules.

# The bundled web app is loaded from local assets and does not depend on any
# reflection into the APK classes, so no custom keep rules are required beyond
# the defaults. If a JavaScript bridge is added later, keep its annotated
# methods:
#   -keepclassmembers class * { @android.webkit.JavascriptInterface <methods>; }
