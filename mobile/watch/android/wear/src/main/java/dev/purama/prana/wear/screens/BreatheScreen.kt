package dev.purama.prana.wear.screens

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.wear.compose.material.Button
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.Text
import kotlinx.coroutines.delay

private data class Step(val label: String, val durationSec: Int, val scale: Float)

private val Steps = listOf(
    Step("Inspire 4s", 4, 1.6f),
    Step("Retiens 7s", 7, 1.6f),
    Step("Expire 8s", 8, 1.0f),
)
private const val TARGET_CYCLES = 4

@Composable
fun BreatheScreen() {
    var running by remember { mutableStateOf(false) }
    var done by remember { mutableStateOf(false) }
    var stepIndex by remember { mutableIntStateOf(0) }
    var cycle by remember { mutableIntStateOf(0) }

    val targetScale = if (running) Steps[stepIndex].scale else 1f
    val animatedScale by animateFloatAsState(
        targetValue = targetScale,
        animationSpec = tween(durationMillis = (Steps[stepIndex].durationSec * 1000)),
        label = "breath",
    )

    LaunchedEffect(running, stepIndex, cycle) {
        if (!running) return@LaunchedEffect
        delay((Steps[stepIndex].durationSec * 1000).toLong())
        if (stepIndex >= Steps.size - 1) {
            stepIndex = 0
            cycle += 1
            if (cycle >= TARGET_CYCLES) {
                running = false
                done = true
            }
        } else {
            stepIndex += 1
        }
    }

    Column(
        modifier = Modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Box(
            modifier = Modifier
                .size(110.dp)
                .scale(animatedScale)
                .background(Color(0x40F472B6), shape = CircleShape),
            contentAlignment = Alignment.Center,
        ) {
            if (done) {
                Text("✓", style = MaterialTheme.typography.display1)
            } else if (running) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(Steps[stepIndex].label, style = MaterialTheme.typography.caption2)
                    Text("${cycle + 1}/$TARGET_CYCLES", style = MaterialTheme.typography.caption3)
                }
            } else {
                Text("4·7·8", style = MaterialTheme.typography.title3)
            }
        }

        androidx.compose.foundation.layout.Spacer(Modifier.size(12.dp))

        Button(onClick = {
            if (running) {
                running = false
            } else if (done) {
                done = false
                stepIndex = 0
                cycle = 0
            } else {
                running = true
                stepIndex = 0
                cycle = 0
            }
        }) {
            Text(if (running) "Stop" else if (done) "Recommencer" else "Démarrer")
        }
    }
}
