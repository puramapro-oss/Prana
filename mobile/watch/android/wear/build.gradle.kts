plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

android {
    namespace = "dev.purama.prana.wear"
    compileSdk = 35

    defaultConfig {
        applicationId = "dev.purama.prana.wear"
        minSdk = 30
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
    }

    buildFeatures { compose = true }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
}

dependencies {
    // Core Wear OS
    implementation("androidx.wear:wear:1.3.0")
    implementation("androidx.activity:activity-compose:1.9.3")

    // Wear Compose
    val wearCompose = "1.4.0"
    implementation("androidx.wear.compose:compose-material:$wearCompose")
    implementation("androidx.wear.compose:compose-foundation:$wearCompose")
    implementation("androidx.wear.compose:compose-navigation:$wearCompose")

    // Compose
    val composeBom = platform("androidx.compose:compose-bom:2024.10.01")
    implementation(composeBom)
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.foundation:foundation")
    implementation("androidx.compose.material:material-icons-core")

    // Tiles + ProtoLayout
    implementation("androidx.wear.tiles:tiles:1.4.0")
    implementation("androidx.wear.protolayout:protolayout:1.2.0")
    implementation("androidx.wear.protolayout:protolayout-material:1.2.0")
    implementation("androidx.wear.protolayout:protolayout-expression:1.2.0")

    // Health Services
    implementation("androidx.health:health-services-client:1.1.0-alpha04")

    // Phone DataLayer
    implementation("com.google.android.gms:play-services-wearable:18.2.0")

    // Coroutines + Guava bridge
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-guava:1.8.1")
}
