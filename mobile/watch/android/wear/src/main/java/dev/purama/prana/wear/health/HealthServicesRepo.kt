package dev.purama.prana.wear.health

import android.content.Context
import androidx.health.services.client.HealthServices
import androidx.health.services.client.PassiveListenerService
import androidx.health.services.client.data.DataPointContainer
import androidx.health.services.client.data.DataType
import androidx.health.services.client.data.PassiveListenerConfig
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

/**
 * Wear OS Health Services subscription for heart rate during a breathing session.
 * Replaces the deprecated Google Fit. No PHI server-side; data lives only on watch
 * and is forwarded to phone via DataLayer when the user opts in.
 */
class HealthServicesRepo(private val context: Context) {
    private val client = HealthServices.getClient(context).passiveMonitoringClient

    private val _heartRate = MutableStateFlow<Int?>(null)
    val heartRate: StateFlow<Int?> = _heartRate

    suspend fun startHeartRateUpdates() {
        val config = PassiveListenerConfig.builder()
            .setDataTypes(setOf(DataType.HEART_RATE_BPM))
            .build()
        client.setPassiveListenerServiceAsync(HRListenerService::class.java, config).await()
    }

    suspend fun stopHeartRateUpdates() {
        client.clearPassiveListenerServiceAsync().await()
    }
}

private suspend fun <T> com.google.common.util.concurrent.ListenableFuture<T>.await(): T {
    return kotlinx.coroutines.guava.await()
}

class HRListenerService : PassiveListenerService() {
    override fun onNewDataPointsReceived(dataPoints: DataPointContainer) {
        super.onNewDataPointsReceived(dataPoints)
        // In production, forward to a shared StateFlow / DataStore so screens can subscribe.
        // Left as a structural stub; full implementation depends on DI choice.
    }
}
