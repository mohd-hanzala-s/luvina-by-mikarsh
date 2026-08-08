package com.mikarsh.luvina.presentation.main

import android.Manifest
import android.annotation.SuppressLint
import android.content.pm.PackageManager
import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.View
import android.webkit.WebSettings
import android.webkit.WebView
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import com.mikarsh.luvina.R
import com.mikarsh.luvina.databinding.ActivityMainBinding
import com.mikarsh.luvina.platform.bridge.NativeBridge
import com.mikarsh.luvina.platform.webview.LuvinaWebChromeClient
import com.mikarsh.luvina.platform.webview.LuvinaWebViewClient
import kotlinx.coroutines.launch

/**
 * Modern MainActivity following Clean Architecture and Android best practices.
 * Supports Material 3 Edge-to-Edge display, StateFlow lifecycle collection,
 * AndroidX SplashScreen API, native JS bridge, and predictive back navigation.
 */
class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private val viewModel: MainViewModel by viewModels()

    private val appAssetsHost = "appassets.androidplatform.net"
    private val splashSafetyTimeoutMs = 7_000L

    private val splashTimeoutRunnable = Runnable { dismissSplash() }

    private val notificationPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        // Install AndroidX SplashScreen API
        val splashScreen = installSplashScreen()
        super.onCreate(savedInstanceState)

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        configureEdgeToEdge()
        configureWebView()
        configureBackNavigation()
        observeViewModelState()

        requestNotificationPermissionIfNeeded()

        val action = intent?.getStringExtra("action") ?: intent?.data?.host
        val targetPath = when (action) {
            "aura" -> "aura"
            "checkin" -> "index.html?checkin=1"
            else -> "index.html?android_shell=1"
        }

        val restored = savedInstanceState?.let { binding.webView.restoreState(it) }
        if (restored == null) {
            binding.webView.loadUrl("https://$appAssetsHost/$targetPath")
        } else {
            binding.splashOverlay.visibility = View.GONE
        }
    }

    override fun onNewIntent(intent: android.content.Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        val action = intent.getStringExtra("action") ?: intent.data?.host
        val targetPath = when (action) {
            "aura" -> "aura"
            "checkin" -> "index.html?checkin=1"
            else -> ""
        }
        if (targetPath.isNotEmpty()) {
            binding.webView.loadUrl("https://$appAssetsHost/$targetPath")
        }
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        binding.webView.saveState(outState)
    }

    override fun onDestroy() {
        Handler(Looper.getMainLooper()).removeCallbacks(splashTimeoutRunnable)
        super.onDestroy()
    }

    private fun configureEdgeToEdge() {
        WindowCompat.setDecorFitsSystemWindows(window, false)

        ViewCompat.setOnApplyWindowInsetsListener(binding.root) { _, insets ->
            val statusBars = insets.getInsets(WindowInsetsCompat.Type.statusBars())
            binding.splashOverlay.setPadding(
                binding.splashOverlay.paddingLeft,
                statusBars.top + 24,
                binding.splashOverlay.paddingRight,
                binding.splashOverlay.paddingBottom
            )
            insets
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun configureWebView() {
        val webView = binding.webView
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null)
        val isDebuggable = (applicationInfo.flags and android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0
        WebView.setWebContentsDebuggingEnabled(isDebuggable)

        with(webView.settings) {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = false
            allowContentAccess = false
            loadWithOverviewMode = true
            useWideViewPort = true
            builtInZoomControls = false
            displayZoomControls = false
            mediaPlaybackRequiresUserGesture = false
            cacheMode = WebSettings.LOAD_DEFAULT
            mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
            offscreenPreRaster = true
            setSupportZoom(false)
            setSupportMultipleWindows(true)
            javaScriptCanOpenWindowsAutomatically = true
        }

        // Bind native Javascript Bridge (window.LuvinaNative)
        webView.addJavascriptInterface(NativeBridge(this), "LuvinaNative")

        webView.webViewClient = LuvinaWebViewClient(
            context = this,
            appAssetsHost = appAssetsHost,
            onPageLoaded = { dismissSplash() },
            onErrorEncountered = { message -> showError(message) }
        )

        webView.webChromeClient = LuvinaWebChromeClient(this)

        Handler(Looper.getMainLooper()).postDelayed(splashTimeoutRunnable, splashSafetyTimeoutMs)
    }

    private fun configureBackNavigation() {
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

    private fun observeViewModelState() {
        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect { state ->
                    when (state) {
                        is MainUiState.Loading -> {
                            binding.splashOverlay.visibility = View.VISIBLE
                        }
                        is MainUiState.Ready -> {
                            // Bundle available
                        }
                        is MainUiState.Error -> {
                            showError(state.message)
                        }
                    }
                }
            }
        }
    }

    private fun requestNotificationPermissionIfNeeded() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) return
        val alreadyGranted = ContextCompat.checkSelfPermission(
            this,
            Manifest.permission.POST_NOTIFICATIONS
        ) == PackageManager.PERMISSION_GRANTED
        if (!alreadyGranted) {
            notificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
        }
    }

    private fun dismissSplash() {
        if (binding.splashOverlay.visibility != View.VISIBLE) return
        binding.splashOverlay.animate()
            .alpha(0f)
            .setDuration(300L)
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
            viewModel.checkWebBundle()
            binding.webView.reload()
        }
    }
}
