package dev.purama.prana.wear.tiles

import android.content.Context
import androidx.wear.tiles.RequestBuilders
import androidx.wear.tiles.TileBuilders.Tile
import androidx.wear.tiles.TileService
import androidx.wear.protolayout.ColorBuilders.argb
import androidx.wear.protolayout.LayoutElementBuilders.Box
import androidx.wear.protolayout.LayoutElementBuilders.Column
import androidx.wear.protolayout.LayoutElementBuilders.FontStyles
import androidx.wear.protolayout.LayoutElementBuilders.HorizontalAlignmentProp
import androidx.wear.protolayout.LayoutElementBuilders.HORIZONTAL_ALIGN_CENTER
import androidx.wear.protolayout.LayoutElementBuilders.LayoutElement
import androidx.wear.protolayout.LayoutElementBuilders.Layout
import androidx.wear.protolayout.LayoutElementBuilders.Text
import androidx.wear.protolayout.ResourceBuilders.Resources
import androidx.wear.protolayout.TimelineBuilders.Timeline
import androidx.wear.protolayout.TimelineBuilders.TimelineEntry
import com.google.common.util.concurrent.Futures
import com.google.common.util.concurrent.ListenableFuture

private const val RESOURCES_VERSION = "1"

/** Wear OS Tile that surfaces the current PRANA streak on the home glance. */
class StreakTileService : TileService() {
    override fun onTileRequest(request: RequestBuilders.TileRequest): ListenableFuture<Tile> {
        val streak = currentStreak(applicationContext)
        val tile = Tile.Builder()
            .setResourcesVersion(RESOURCES_VERSION)
            .setTileTimeline(
                Timeline.Builder().addTimelineEntry(
                    TimelineEntry.Builder().setLayout(
                        Layout.Builder().setRoot(buildLayout(streak)).build()
                    ).build()
                ).build()
            )
            .setFreshnessIntervalMillis(60 * 60 * 1000) // refresh every hour
            .build()
        return Futures.immediateFuture(tile)
    }

    override fun onTileResourcesRequest(request: RequestBuilders.ResourcesRequest): ListenableFuture<Resources> {
        return Futures.immediateFuture(Resources.Builder().setVersion(RESOURCES_VERSION).build())
    }

    private fun buildLayout(streak: Int): LayoutElement {
        val PINK = argb(0xFFF472B6.toInt())
        val MUTED = argb(0xFF9999A0.toInt())
        return Box.Builder()
            .setHorizontalAlignment(HorizontalAlignmentProp.Builder().setValue(HORIZONTAL_ALIGN_CENTER).build())
            .addContent(
                Column.Builder()
                    .addContent(
                        Text.Builder().setText("Série").setFontStyle(FontStyles.caption1(null).build())
                            .setMaxLines(1).build()
                    )
                    .addContent(
                        Text.Builder().setText(streak.toString())
                            .setFontStyle(FontStyles.display1(null).setColor(PINK).build()).build()
                    )
                    .addContent(
                        Text.Builder().setText(if (streak >= 7) "Bravo" else "Reprends")
                            .setFontStyle(FontStyles.caption3(null).setColor(MUTED).build()).build()
                    )
                    .build()
            )
            .build()
    }

    private fun currentStreak(ctx: Context): Int {
        return ctx.getSharedPreferences("prana", Context.MODE_PRIVATE).getInt("streak_days", 0)
    }
}
