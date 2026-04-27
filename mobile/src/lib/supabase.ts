import "react-native-url-polyfill/auto"
import * as SecureStore from "expo-secure-store"
import { createClient } from "@supabase/supabase-js"
import { Platform } from "react-native"
import Constants from "expo-constants"

/**
 * Supabase client for PRANA mobile.
 *
 * Auth storage adapter: SecureStore on native, localStorage on web.
 * Without this, auth crashes on native because window/localStorage don't exist.
 *
 * Source CLAUDE.md §16 (auth mobile critique).
 */

const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  (Constants.expoConfig?.extra?.supabaseUrl as string | undefined) ??
  "https://auth.purama.dev"

const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  (Constants.expoConfig?.extra?.supabaseAnonKey as string | undefined) ??
  ""

interface StorageAdapter {
  getItem(key: string): Promise<string | null>
  setItem(key: string, value: string): Promise<void>
  removeItem(key: string): Promise<void>
}

const webStorage: StorageAdapter = {
  getItem: async (key) => (typeof localStorage !== "undefined" ? localStorage.getItem(key) : null),
  setItem: async (key, value) => {
    if (typeof localStorage !== "undefined") localStorage.setItem(key, value)
  },
  removeItem: async (key) => {
    if (typeof localStorage !== "undefined") localStorage.removeItem(key)
  },
}

// SecureStore enforces 2 KB per value — Supabase tokens are ~3-4 KB. Split.
const SECURE_CHUNK_SIZE = 1800

const nativeStorage: StorageAdapter = {
  getItem: async (key) => {
    try {
      const meta = await SecureStore.getItemAsync(`${key}_meta`)
      if (meta) {
        const count = parseInt(meta, 10)
        const parts: string[] = []
        for (let i = 0; i < count; i++) {
          const part = await SecureStore.getItemAsync(`${key}_${i}`)
          if (part === null) return null
          parts.push(part)
        }
        return parts.join("")
      }
      return await SecureStore.getItemAsync(key)
    } catch {
      return null
    }
  },
  setItem: async (key, value) => {
    if (value.length <= SECURE_CHUNK_SIZE) {
      await SecureStore.deleteItemAsync(`${key}_meta`).catch(() => {})
      await SecureStore.setItemAsync(key, value)
      return
    }
    const chunks: string[] = []
    for (let i = 0; i < value.length; i += SECURE_CHUNK_SIZE) {
      chunks.push(value.slice(i, i + SECURE_CHUNK_SIZE))
    }
    await SecureStore.deleteItemAsync(key).catch(() => {})
    await SecureStore.setItemAsync(`${key}_meta`, String(chunks.length))
    await Promise.all(chunks.map((c, i) => SecureStore.setItemAsync(`${key}_${i}`, c)))
  },
  removeItem: async (key) => {
    try {
      const meta = await SecureStore.getItemAsync(`${key}_meta`)
      if (meta) {
        const count = parseInt(meta, 10)
        await SecureStore.deleteItemAsync(`${key}_meta`)
        for (let i = 0; i < count; i++) {
          await SecureStore.deleteItemAsync(`${key}_${i}`).catch(() => {})
        }
      } else {
        await SecureStore.deleteItemAsync(key)
      }
    } catch {
      // already gone
    }
  },
}

const storage = Platform.OS === "web" ? webStorage : nativeStorage

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === "web",
  },
})

export const APP_BASE_URL =
  process.env.EXPO_PUBLIC_APP_URL ?? "https://prana.purama.dev"
