package com.mikarsh.luvina.platform.webview

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.webkit.WebViewAssetLoader

/**
 * Defensive WebView client managing offline local asset serving via [WebViewAssetLoader],
 * route resolution mapping (/calendar -> /calendar.html), external link delegation, and error handling.
 */
class LuvinaWebViewClient(
    private val context: Context,
    private val appAssetsHost: String,
    private val onPageLoaded: () -> Unit,
    private val onErrorEncountered: (String) -> Unit
) : WebViewClient() {

    private val assetLoader: WebViewAssetLoader by lazy {
        WebViewAssetLoader.Builder()
            .setDomain(appAssetsHost)
            .addPathHandler("/", WebViewAssetLoader.AssetsPathHandler(context))
            .build()
    }

    override fun shouldInterceptRequest(
        view: WebView,
        request: WebResourceRequest
    ): WebResourceResponse? {
        val direct = runCatching {
            assetLoader.shouldInterceptRequest(request.url)
        }.getOrNull()
        if (direct != null) return direct

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
        request: WebResourceRequest
    ): Boolean {
        val url = request.url ?: return false
        if (url.host == appAssetsHost) return false

        return runCatching {
            context.startActivity(Intent(Intent.ACTION_VIEW, url))
        }.isSuccess
    }

    override fun onPageFinished(view: WebView?, url: String?) {
        super.onPageFinished(view, url)
        val currentHost = url?.let { Uri.parse(it).host }
        if (currentHost == appAssetsHost) {
            onPageLoaded()
        }
    }

    override fun onReceivedError(
        view: WebView?,
        request: WebResourceRequest?,
        error: WebResourceError?
    ) {
        super.onReceivedError(view, request, error)
        if (request?.isForMainFrame == true) {
            val message = error?.description?.toString()
                ?.takeIf { it.isNotBlank() }
                ?: "The application could not load local resources."
            onErrorEncountered(message)
        }
    }
}
