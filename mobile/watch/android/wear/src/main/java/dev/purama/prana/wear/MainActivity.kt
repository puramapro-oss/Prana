package dev.purama.prana.wear

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.wear.compose.foundation.pager.HorizontalPager
import androidx.wear.compose.foundation.pager.rememberPagerState
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.Scaffold
import dev.purama.prana.wear.data.PhoneDataLayer
import dev.purama.prana.wear.screens.BreatheScreen
import dev.purama.prana.wear.screens.StreakScreen
import dev.purama.prana.wear.screens.TodayScreen
import dev.purama.prana.wear.screens.UnauthenticatedScreen

class MainActivity : ComponentActivity() {
    private lateinit var phone: PhoneDataLayer

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        phone = PhoneDataLayer(applicationContext)
        phone.start()
        setContent {
            PranaWearApp(phone)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        phone.stop()
    }
}

@Composable
fun PranaWearApp(phone: PhoneDataLayer) {
    val state by phone.state.collectAsState()
    MaterialTheme {
        Scaffold {
            if (state.accessToken.isNullOrBlank()) {
                UnauthenticatedScreen()
            } else {
                val pagerState = rememberPagerState(initialPage = 0) { 3 }
                HorizontalPager(state = pagerState) { page ->
                    when (page) {
                        0 -> TodayScreen(phone = phone)
                        1 -> BreatheScreen()
                        else -> StreakScreen(streakDays = state.streakDays)
                    }
                }
            }
        }
    }
}
