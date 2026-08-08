package com.mikarsh.luvina.platform.webview

import android.content.Context
import android.content.Intent
import android.os.Handler
import android.os.Looper
import android.os.Message
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient

/**
 * WebChromeClient handling popup windows (`window.open`), external links, and progress.
 */
class LuvinaWebChromeClient(private val context: Context) : WebChromeClient() {

    override fun onCreateWindow(
        view: WebView,
        isDialog: Boolean,
        isUserGesture: Boolean,
        resultMsg: Message
    ): Boolean {
        val popup = WebView(context)
        popup.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(
                popupView: WebView,
                request: WebResourceRequest
            ): Boolean {
                runCatching {
                    val intent = Intent(Intent.ACTION_VIEW, request.url).apply {
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    context.startActivity(intent)
                }
                Handler(Looper.getMainLooper()).post { popup.destroy() }
                return true
            }
        }
        (resultMsg.obj as WebView.WebViewTransport).webView = popup
        resultMsg.sendToTarget()
        return true
    }
}
