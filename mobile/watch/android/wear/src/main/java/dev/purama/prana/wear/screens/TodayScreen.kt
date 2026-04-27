package dev.purama.prana.wear.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Send
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.wear.compose.material.Button
import androidx.wear.compose.material.Icon
import androidx.wear.compose.material.InlineSlider
import androidx.wear.compose.material.InlineSliderDefaults
import androidx.wear.compose.material.Text
import dev.purama.prana.wear.data.PhoneDataLayer

@Composable
fun TodayScreen(phone: PhoneDataLayer) {
    var stress by remember { mutableFloatStateOf(3f) }
    var energy by remember { mutableFloatStateOf(3f) }
    var sending by remember { mutableStateOf(false) }
    var feedback by remember { mutableStateOf<String?>(null) }

    Column(
        modifier = Modifier.fillMaxSize().padding(horizontal = 8.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text("Pulse rapide", style = androidx.wear.compose.material.MaterialTheme.typography.caption2)

        InlineSlider(
            value = stress,
            onValueChange = { stress = it },
            valueRange = 1f..5f,
            steps = 3,
            decreaseIcon = { Text("😌") },
            increaseIcon = { Text("😣") },
            colors = InlineSliderDefaults.colors(
                selectedBarColor = androidx.compose.ui.graphics.Color(0xFFF472B6),
            ),
        )

        InlineSlider(
            value = energy,
            onValueChange = { energy = it },
            valueRange = 1f..5f,
            steps = 3,
            decreaseIcon = { Text("😴") },
            increaseIcon = { Text("⚡") },
            colors = InlineSliderDefaults.colors(
                selectedBarColor = androidx.compose.ui.graphics.Color(0xFFF472B6),
            ),
        )

        Button(
            onClick = {
                if (!sending) {
                    sending = true
                    phone.sendPulse(stress.toInt(), energy.toInt()) { ok ->
                        sending = false
                        feedback = if (ok) "Enregistré ✓" else "Erreur — réessaie"
                    }
                }
            },
            enabled = !sending,
        ) {
            Icon(Icons.Filled.Send, contentDescription = "Envoyer")
        }

        feedback?.let { Text(it, style = androidx.wear.compose.material.MaterialTheme.typography.caption3) }
    }
}
