---
name: pixel-pet
description: Retro 90s Tamagotchi-style pet skill for AI Edge Gallery (Gemma 4 compatible) with persistent real-time decay, care actions, evolution, sickness, sleep, poop, discipline, and permanent death. Use when users ask to start pet care, check status, feed/play/clean/medicate/discipline/sleep/wake, or explicitly ask to show/open/display a pet dashboard.
---

# Pixel Pet

## Instructions

Always call `run_js` for this skill.

### Script name
- `index.html`

### Payload schema
Send `data` as a JSON string with one field:
- `action`: string, one of:
  - `start_pet`
  - `show_dashboard`
  - `status`
  - `feed_meal`
  - `feed_snack`
  - `play`
  - `clean`
  - `medicine`
  - `discipline`
  - `sleep`
  - `wake`
  - `tick`

### Trigger/action mapping rules
- If user says **“start my pet”**, **“start pet”**, or similar: use `start_pet`.
- If user says **“show my pet”**, **“open dashboard”**, **“display my pet”**, **“show dashboard”**, or similar: use `show_dashboard`.
- If user asks for state check: use `status`.
- Use specific care action names for care requests.

### Response contract from JS
The script returns a stringified JSON object containing:
- `result`: short summary text
- `narration`: short retro flavor line
- `pet`: full persistent state
- `dead`: boolean
- `sprite_variant`: current sprite/state variant
- `version`: skill runtime version
- `webview` (when dashboard should open):
  - `url`: dashboard path or URL
  - `aspectRatio`: number

It may also include:
- `dashboard_url`: reliable fallback URL for external opening
- `error`: failure message

## Behavior requirements

- Keep one fixed pet named `mame`.
- Persist state across turns.
- Apply wall-clock decay between interactions.
- Support stats: hunger, happiness, energy, hygiene, health, discipline, age, weight.
- Support lifecycle/events: poop, sickness, sleep, attention, evolution, permanent death.
- Keep narration short and retro toy-like.
- If pet is dead, state it plainly; do not auto-revive.
