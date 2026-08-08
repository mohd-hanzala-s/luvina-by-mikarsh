package com.mikarsh.luvina.presentation.main

/**
 * UI State representation for MainActivity.
 */
sealed interface MainUiState {
    object Loading : MainUiState
    data class Ready(val hasBundle: Boolean) : MainUiState
    data class Error(val message: String) : MainUiState
}
