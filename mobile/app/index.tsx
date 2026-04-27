import { Redirect } from "expo-router"

// AuthGate in _layout will redirect appropriately. This is just a fallback.
export default function Index() {
  return <Redirect href="/(tabs)/today" />
}
