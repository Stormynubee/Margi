# Margi device smoke matrix

Run after stabilization changes on a physical Android device (Expo dev client or release build).

| # | Flow | Steps | Expected | Device | Date | Result |
|---|------|-------|----------|--------|------|--------|
| 1 | Plan Corridor | Home → ENTER DRIVE MODE → Trip tab | Map + bottom sheet; route cards scroll; **Start Driving** visible | Pixel 7 Pro | 2026-05-31 | pass |
| 2 | Full drive | Start Driving → calibration → HUD | Fixed HUD (no scroll); **SOS strip at top**; compact speedo; menu offers End trip & summary | Pixel 7 Pro | 2026-05-31 | pass |
| 3 | End journey | HUD menu → Exit drive OR End trip → complete | Trip destination cleared; Home reachable | Pixel 7 Pro | 2026-05-31 | pass |
| 4 | Settings gear | Open settings from Home, Trip, Community, Profile | `/settings` Configuration screen | Pixel 7 Pro | 2026-05-31 | pass |
| 5 | Profile tab | Tap Profile in tab bar | Highlights correctly; no crash | Pixel 7 Pro | 2026-05-31 | pass |
| 6 | Profile photo | Change photo on Profile | Picker opens; avatar persists | Pixel 7 Pro | 2026-05-31 | pass |
| 7 | Voice off | Settings/Profile: voice crash detection off → journey | No mic; HUD voice standby | Pixel 7 Pro | 2026-05-31 | pass |
| 8 | Distress modal | Simulate crash on HUD only | Modal on foreground journey; no backdrop dismiss | Pixel 7 Pro | 2026-05-31 | pass |
| 9 | Idle safety | Home/Community idle | No distress modal from voice/impact | Pixel 7 Pro | 2026-05-31 | pass |
| 10 | Sensor check | Profile → Motion Sensor Calibration | Preview only; no live journey | Pixel 7 Pro | 2026-05-31 | pass |
| 11 | Emergency SOS | Hold SOS 3s on **top HUD strip** (no scroll) | Emergency Activation splash opens, then Trauma Response | Pixel 7 Pro | 2026-05-31 | pass |
| 12 | Accessibility | Profile → Accessibility | Back returns to profile | Pixel 7 Pro | 2026-05-31 | pass |
| 13 | Naari home (female) | Medical → Female → Home | Stacked drive + Naari cards; male profile shows drive card only | Pixel 7 Pro | 2026-05-31 | pass |
| 14 | Naari protocol + portal | Tap Naari → Enable Portal → Safety Mode ON | Portal loads; toggle persists | Pixel 7 Pro | 2026-05-31 | pass |
| 15 | Naari emergency hold | Hold Emergency Help 2s once | Distress HUD on first hold; SMS composer opens; no second hold needed | Pixel 7 Pro | 2026-05-31 | pass |
| 16 | Home weather | Home → Daily Safety Brief (location on) | City + °C from GPS; Open-Meteo summary | Pixel 7 Pro | 2026-05-31 | pass |
| 17 | Home weather denied | Deny location permission | “Location unavailable” + settings hint; no crash | Pixel 7 Pro | 2026-05-31 | pass |
| 18 | Safety briefs | Tap Protocol Alpha / Regional Alert | Detail screens with institutional copy | Pixel 7 Pro | 2026-05-31 | pass |
| 19 | Quick SOS confirm | Tap Quick SOS → Cancel | Stays on home; no activation screen | Pixel 7 Pro | 2026-05-31 | pass |
| 20 | Quick SOS proceed | Tap Quick SOS → Proceed | Activation splash with language + mode selector | Pixel 7 Pro | 2026-05-31 | pass |
| 20b | Trauma response | Activation auto/guided → scroll down | Chatbot, first-aid board, dispatch cards, QR visible | Pixel 7 Pro | 2026-05-31 | pass |
| 21 | Report Hazard | Tap Report Hazard | Feedback form with safety category | Pixel 7 Pro | 2026-05-31 | pass |
| 22 | Sarthi home widget | Home → peek bubble → FAB → expand | Peek 5s; pulse FAB; mini panel + quick links + chat | Pixel 7 Pro | 2026-05-31 | pass |
| 23 | Journey + tab switch | Active journey → Home / Community / Settings tabs | No distress modal from UI sounds or app speech | Pixel 7 Pro | 2026-05-31 | pass |
| 24 | Journey + notification | Play phone notification chime during journey | No distress modal | Pixel 7 Pro | 2026-05-31 | pass |
| 25 | Journey + test yell | Loud intentional yell near mic (test only) | Distress modal after ~1–2 s confirmation | Pixel 7 Pro | 2026-05-31 | pass |
| 26 | Naari only | Safety Mode ON, no active journey, idle on portal/home | Mic policy active; no false modal while idle | Pixel 7 Pro | 2026-05-31 | pass |
| 27 | Supabase auth | Sign up → sign out → sign in | Session persists; profile syncs from Supabase | Pixel 7 Pro | 2026-05-31 | pass |
| 28 | NGO registry | Settings → NGO → Register → verify in Studio | Verified provider appears in nearby list | Pixel 7 Pro | 2026-05-31 | pass |
| 29 | OSRM trip | Trip tab: enter destination online | Real km/min + OSRM polyline on map | Pixel 7 Pro | 2026-05-31 | pass |
| 30 | Sarthi BFF | Sarthi with deployed BFF URL | Status chip shows Gemini BFF online | Pixel 7 Pro | 2026-05-31 | pass |
| 31 | Auto dispatch | Emergency Auto mode with dispatch URLs | HTTP POST; real responder names; no fake alerts | Pixel 7 Pro | 2026-05-31 | pass |
| 32 | Crash source | Dev build journey + simulate crash | Modal shows Sensors/Manual source badge | Pixel 6a | 2026-05-28 | pass |
| 33 | SOS auto SMS | Hold SOS 3s on HUD | SMS 108 composer opens with GPS (user taps Send) | Pixel 6a | 2026-05-28 | pass |
| 34 | Web relay | Open relay URL from GHP screen | Browser shows triage + Maps + SMS 108 | Desktop Chrome | 2026-05-28 | pass |

**Recorded rows:** 33–34 are template examples — replace device/date after your own run.

**Commands before release:** `npm run typecheck` · `npm test`
