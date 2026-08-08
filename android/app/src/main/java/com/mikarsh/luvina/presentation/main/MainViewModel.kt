package com.mikarsh.luvina.presentation.main

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * ViewModel managing MainActivity initialization, bundle verification, and UI state.
 */
class MainViewModel(application: Application) : AndroidViewModel(application) {

    private val _uiState = MutableStateFlow<MainUiState>(MainUiState.Loading)
    val uiState: StateFlow<MainUiState> = _uiState.asStateFlow()

    init {
        checkWebBundle()
    }

    fun checkWebBundle() {
        viewModelScope.launch {
            val hasBundle = runCatching {
                getApplication<Application>().assets.open("www/index.html").use { true }
            }.getOrDefault(false)

            if (hasBundle) {
                _uiState.value = MainUiState.Ready(hasBundle = true)
            } else {
                _uiState.value = MainUiState.Error(
                    message = "The bundled static web application is missing. Build with `pnpm android:sync` first."
                )
            }
        }
    }

    fun setError(message: String) {
        _uiState.value = MainUiState.Error(message)
    }

    fun setReady() {
        _uiState.value = MainUiState.Ready(hasBundle = true)
    }
}
