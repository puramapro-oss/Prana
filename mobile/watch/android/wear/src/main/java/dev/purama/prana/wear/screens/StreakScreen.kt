package dev.purama.prana.wear.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.Text

@Composable
fun StreakScreen(streakDays: Int) {
    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text("Série", style = MaterialTheme.typography.caption2, color = Color(0xFF9999A0))
        Text(
            text = streakDays.toString(),
            style = MaterialTheme.typography.display1,
            color = Color(0xFFF472B6),
        )
        Text(
            text = if (streakDays >= 7) "Bravo, ça tient." else "Reprends quand tu veux.",
            style = MaterialTheme.typography.caption3,
            color = Color(0xFF9999A0),
        )
    }
}

@Composable
fun UnauthenticatedScreen() {
    Column(
        modifier = Modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text("Connecte-toi sur ton téléphone", style = MaterialTheme.typography.caption1)
    }
}
