export type AnalyticsEvent =
  | "signup_completed"
  | "first_pulse_check"
  | "pulse_check_submitted"
  | "magic_button_clicked"
  | "magic_button_used"
  | "protocol_started"
  | "protocol_completed"
  | "capture_created"
  | "execute_generated"
  | "room_joined"
  | "room_left"
  | "room_message_posted"
  | "room_day_ticked"
  | "referral_link_shared"
  | "referral_converted"
  | "twin_updated"
  | "checkout_started"
  | "checkout_completed"
  | "subscription_canceled"
  | "safety_critical_flagged"
  | "sos_button_pressed"

export function track(event: AnalyticsEvent, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return
  type PHGlobal = { capture?: (event: string, properties?: Record<string, unknown>) => void }
  const ph = (window as unknown as { posthog?: PHGlobal }).posthog
  if (ph?.capture) ph.capture(event, properties)
}

export function identify(userId: string, traits?: Record<string, unknown>) {
  if (typeof window === "undefined") return
  type PHGlobal = { identify?: (userId: string, traits?: Record<string, unknown>) => void }
  const ph = (window as unknown as { posthog?: PHGlobal }).posthog
  if (ph?.identify) ph.identify(userId, traits)
}

export function reset() {
  if (typeof window === "undefined") return
  type PHGlobal = { reset?: () => void }
  const ph = (window as unknown as { posthog?: PHGlobal }).posthog
  if (ph?.reset) ph.reset()
}
