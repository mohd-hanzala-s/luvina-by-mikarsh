package com.mikarsh.luvina

import android.Manifest
import android.annotation.SuppressLint
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.Message
import android.view.View
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.webkit.WebViewAssetLoader
import com.mikarsh.luvina.databinding.ActivityMainBinding

/**
 * Luvina's native Android shell.
 *
 * The app is fully self-contained: the static web build is bundled inside the
 * APK (`assets/www/`) and served through [WebViewAssetLoader] under a local
 * HTTPS origin, so it runs offline with zero network or web-deployment
 * dependency.
 *
 * A branded native splash (logo + name + tagline) covers the cold start and is
 * faded out as soon as the bundled app finishes loading. The web app detects
 * the `android_shell` marker and skips its own splash, so the splash appears
 * exactly once per launch and never during in-app navigation.
 *
 * The shell is defensive by design: any asset-serving or loading failure is
 * surfaced as an on-screen message (with a Retry button) instead of crashing
 * the app, and the splash always clears via a timeout so the app can never be
 * stuck on the launch screen.
 */
class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    private val appAssetsHost = "appassets.androidplatform.net"
    private val splashSafetyTimeoutMs = 8_000L

    private val assetLoader: WebViewAssetLoader by lazy {
        WebViewAssetLoader.Builder()
            .setDomain(appAssetsHost)
            .addPathHandler("/", WebViewAssetLoader.AssetsPathHandler(this, "www"))
            .build()
    }

    private val splashTimeout: Runnable by lazy {
        Runnable { dismissSplash() }
    }

    // Android 13+ (API 33) treats notifications as a dangerous runtime
    // permission — declaring POST_NOTIFICATIONS in the manifest alone grants
    // nothing. The web app's own `Notification.requestPermission()` call
    // happens inside the WebView's JS engine and has no path to Android's
    // native permission system, so without this launcher the app's reminder
    // notifications would silently never have permission to show on any
    // device running Android 13 or later. The result callback is
    // intentionally empty: whatever the user picks, the web app reads the
    // outcome itself via the (still-standard) JS `Notification.permission`.
    private val notificationPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { }

    private fun requestNotificationPermissionIfNeeded() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) return
        val alreadyGranted = ContextCompat.checkSelfPermission(
            this,
            Manifest.permission.POST_NOTIFICATIONS,
        ) == PackageManager.PERMISSION_GRANTED
        if (alreadyGranted) return
        notificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        configureWebView()
        handleBackNavigation()

        if (!hasWebBundle()) {
            // The bundled web app is not present (e.g. the APK was built
            // without running `pnpm android:sync` first). Surface a clear,
            // actionable message instead of a blank screen or a crash.
            showError(getString(R.string.error_bundle_missing))
            return
        }

        // No point prompting for a permission the app can't use yet — only
        // ask once we know the bundled app is actually going to load.
        requestNotificationPermissionIfNeeded()

        val restored = savedInstanceState?.let { binding.webView.restoreState(it) }
        if (restored == null) {
            // Fresh process: the query marker tells the web app to skip its
            // own splash so the native one is the single launch splash.
            binding.webView.loadUrl("https://$appAssetsHost/index.html?android_shell=1")
        } else {
            // Android reclaimed the process while backgrounded (low memory)
            // and is now recreating the activity. Restoring WebView state
            // returns the user to the exact screen they left instead of a
            // jarring reset back to Home — no native splash needed here, the
            // overlay is simply hidden.
            binding.splashOverlay.visibility = View.GONE
        }
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        binding.webView.saveState(outState)
    }

    override fun onDestroy() {
        Handler(Looper.getMainLooper()).removeCallbacks(splashTimeout)
        super.onDestroy()
    }

    /** True when `assets/www/index.html` is bundled inside the APK. */
    private fun hasWebBundle(): Boolean = runCatching {
        assets.open("www/index.html").use { true }
    }.getOrDefault(false)

    private fun configureWebView() {
        val webView = binding.webView
        webView.setBackgroundColor(android.graphics.Color.WHITE)
        // No overscroll glow — the bundled app already scrolls like a native
        // screen, and the glow effect reads as "web page" rather than "app".
        webView.overScrollMode = View.OVER_SCROLL_NEVER
        with(webView.settings) {
            javaScriptEnabled = true
            domStorageEnabled = true
            // File/content URI access is unused — the app is served entirely
            // through the asset-loader's virtual https origin — so both are
            // left off to shrink the WebView's attack surface.
            allowFileAccess = false
            allowContentAccess = false
            loadWithOverviewMode = true
            useWideViewPort = true
            builtInZoomControls = false
            displayZoomControls = false
            mediaPlaybackRequiresUserGesture = false
            cacheMode = WebSettings.LOAD_DEFAULT
            mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
            // Rasterize just off-screen so Insights charts and long history
            // lists don't visibly build in as they scroll into view.
            offscreenPreRaster = true
            setSupportZoom(false)
            // Settings' "Report a bug" / feedback links and the Drive backup
            // sign-in button open via `window.open()`, which a plain WebView
            // ignores unless multi-window support is explicitly turned on.
            // See the WebChromeClient below for where those windows go.
            setSupportMultipleWindows(true)
            javaScriptCanOpenWindowsAutomatically = true
        }

        webView.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(
                view: WebView,
                request: WebResourceRequest,
            ): WebResourceResponse? {
                // Never let an asset-serving error propagate out of this
                // callback: an uncaught exception here crashes the process.
                val direct = runCatching {
                    assetLoader.shouldInterceptRequest(request.url)
                }.getOrNull()
                if (direct != null) return direct

                // The static export writes each route to `<route>.html` (e.g.
                // `history.html`, root as `index.html`), but a top-level
                // navigation to the extensionless route path itself
                // (`/history`, or bare `/` once the client router has
                // rewritten the address bar) — which can happen on
                // back/forward, a restored WebView state, pull-to-refresh, or
                // a bare `<a href>` — asks the asset loader for a file that
                // doesn't exist under that exact name. Retry once against the
                // matching `.html` file before giving up, so those
                // navigations resolve the same page the client router would
                // have shown.
                if (request.isForMainFrame) {
                    val path = request.url.path.orEmpty()
                    val lastSegment = path.substringAfterLast('/')
                    if (!lastSegment.contains('.')) {
                        val htmlPath = if (path.isEmpty() || path == "/") {
                            "/index.html"
                        } else {
                            path.trimEnd('/') + ".html"
                        }
                        val htmlUrl = request.url.buildUpon().path(htmlPath).build()
                        val viaHtml = runCatching {
                            assetLoader.shouldInterceptRequest(htmlUrl)
                        }.getOrNull()
                        if (viaHtml != null) return viaHtml
                    }
                }

                return null
            }

            override fun shouldOverrideUrlLoading(
                view: WebView,
                request: WebResourceRequest,
            ): Boolean {
                val url = request.url ?: return false
                if (url.host == appAssetsHost) return false
                // Anything outside the bundled app (Help links, Drive OAuth,
                // the GitHub repository) opens in the system browser.
                return runCatching {
                    startActivity(Intent(Intent.ACTION_VIEW, url))
                }.isSuccess
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                if (view?.url?.host == appAssetsHost) {
                    dismissSplash()
                }
            }

            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: android.webkit.WebResourceError?,
            ) {
                super.onReceivedError(view, request, error)
                if (request?.isForMainFrame == true) {
                    val message = error?.description?.toString()
                        ?.takeIf { it.isNotBlank() }
                        ?: getString(R.string.error_message)
                    showError(message)
                }
            }
        }

        // Safety net: if the first paint never reports back, hide the splash
        // anyway so the shell can never stay stuck on the launch screen.
        Handler(Looper.getMainLooper()).postDelayed(splashTimeout, splashSafetyTimeoutMs)

        // `window.open()` targets (the Drive sign-in popup, any `target="_blank"`
        // link) need somewhere to go. There's no second WebView pane in this
        // shell, so a throwaway WebView captures the popup's first navigation
        // and hands it straight to the system browser via the same rule
        // `shouldOverrideUrlLoading` uses for external links, then is
        // discarded — nothing actually renders in-app.
        webView.webChromeClient = object : WebChromeClient() {
            override fun onCreateWindow(
                view: WebView,
                isDialog: Boolean,
                isUserGesture: Boolean,
                resultMsg: Message,
            ): Boolean {
                val popup = WebView(this@MainActivity)
                popup.webViewClient = object : WebViewClient() {
                    override fun shouldOverrideUrlLoading(
                        popupView: WebView,
                        request: WebResourceRequest,
                    ): Boolean {
                        runCatching { startActivity(Intent(Intent.ACTION_VIEW, request.url)) }
                        // Deferred: destroying a WebView from inside its own
                        // navigation callback is asking for trouble, so this
                        // just posts the cleanup for right after.
                        Handler(Looper.getMainLooper()).post { popup.destroy() }
                        return true
                    }
                }
                (resultMsg.obj as WebView.WebViewTransport).webView = popup
                resultMsg.sendToTarget()
                return true
            }
        }
    }

    private fun handleBackNavigation() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (binding.webView.canGoBack()) {
                    binding.webView.goBack()
                } else {
                    finish()
                }
            }
        })
    }

    private fun dismissSplash() {
        if (binding.splashOverlay.visibility != View.VISIBLE) return
        binding.splashOverlay.animate()
            .alpha(0f)
            .setDuration(280L)
            .withEndAction {
                binding.splashOverlay.visibility = View.GONE
                binding.splashOverlay.alpha = 1f
            }
            .start()
    }

    private fun showError(message: String) {
        binding.splashOverlay.visibility = View.GONE
        binding.errorView.visibility = View.VISIBLE
        binding.errorMessage.text = message
        binding.retryButton.setOnClickListener {
            binding.errorView.visibility = View.GONE
            binding.splashOverlay.visibility = View.VISIBLE
            binding.splashOverlay.alpha = 1f
            if (hasWebBundle()) {
                binding.webView.reload()
            } else {
                showError(getString(R.string.error_bundle_missing))
            }
        }
    }
}
