package com.vaja1

import android.os.Bundle
import android.webkit.GeolocationPermissions
import android.webkit.WebChromeClient
import android.webkit.WebView
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled

class MainActivity : ReactActivity() {

    override fun getMainComponentName(): String = "vaja1"

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Initialize WebView and enable geolocation
        val webView = WebView(this)
        webView.settings.javaScriptEnabled = true
        webView.settings.setGeolocationEnabled(true)

        webView.webChromeClient = object : WebChromeClient() {
            override fun onGeolocationPermissionsShowPrompt(
                origin: String,
                callback: GeolocationPermissions.Callback
            ) {
                callback.invoke(origin, true, false) // Grant geolocation permissions
            }
        }
    }
}
