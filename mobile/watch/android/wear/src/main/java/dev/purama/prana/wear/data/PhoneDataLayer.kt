package dev.purama.prana.wear.data

import android.content.Context
import com.google.android.gms.tasks.Tasks
import com.google.android.gms.wearable.DataClient
import com.google.android.gms.wearable.DataEvent
import com.google.android.gms.wearable.DataEventBuffer
import com.google.android.gms.wearable.DataMapItem
import com.google.android.gms.wearable.MessageClient
import com.google.android.gms.wearable.Node
import com.google.android.gms.wearable.Wearable
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import org.json.JSONObject

data class PhoneState(val accessToken: String? = null, val streakDays: Int = 0)

private const val SESSION_PATH = "/prana/session"
private const val PULSE_PATH = "/prana/pulse"

class PhoneDataLayer(private val context: Context) : DataClient.OnDataChangedListener {
    private val data: DataClient = Wearable.getDataClient(context)
    private val msg: MessageClient = Wearable.getMessageClient(context)
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)

    private val _state = MutableStateFlow(PhoneState())
    val state: StateFlow<PhoneState> = _state

    fun start() {
        data.addListener(this, android.net.Uri.parse("wear://*$SESSION_PATH"), DataClient.FILTER_PREFIX)
        // Bootstrap from any existing data items.
        scope.launch {
            try {
                val items = Tasks.await(data.dataItems)
                items.forEach { item ->
                    if (item.uri.path?.startsWith(SESSION_PATH) == true) applySessionItem(DataMapItem.fromDataItem(item))
                }
                items.release()
            } catch (_: Throwable) {
                // Ignore: phone may not be reachable yet.
            }
        }
    }

    fun stop() {
        data.removeListener(this)
        scope.cancel()
    }

    fun sendPulse(stress: Int, energy: Int, callback: (Boolean) -> Unit) {
        scope.launch {
            try {
                val nodes: List<Node> = Tasks.await(Wearable.getNodeClient(context).connectedNodes)
                val target = nodes.firstOrNull { it.isNearby } ?: nodes.firstOrNull()
                if (target == null) {
                    callback(false)
                    return@launch
                }
                val payload = JSONObject().apply {
                    put("type", "pulse_check")
                    put("stress", stress)
                    put("energy", energy)
                }.toString().toByteArray(Charsets.UTF_8)
                Tasks.await(msg.sendMessage(target.id, PULSE_PATH, payload))
                callback(true)
            } catch (_: Throwable) {
                callback(false)
            }
        }
    }

    override fun onDataChanged(events: DataEventBuffer) {
        for (i in 0 until events.count) {
            val ev = events[i]
            if (ev.type == DataEvent.TYPE_CHANGED && ev.dataItem.uri.path?.startsWith(SESSION_PATH) == true) {
                applySessionItem(DataMapItem.fromDataItem(ev.dataItem))
            }
        }
        events.release()
    }

    private fun applySessionItem(item: DataMapItem) {
        val map = item.dataMap
        val token = if (map.containsKey("supabase_access_token")) map.getString("supabase_access_token") else null
        val streak = if (map.containsKey("streak_days")) map.getInt("streak_days") else 0
        _state.update { it.copy(accessToken = token, streakDays = streak) }
    }
}
