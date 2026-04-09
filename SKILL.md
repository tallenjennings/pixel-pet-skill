---
name: pixel-pet
description: v1.0 retro tamagotchi-style virtual pet skill for Google AI Edge Gallery (or compatible run_js runtimes). Use when the user wants to raise a persistent pet with real-time decay, feeding, play, cleaning, medicine, discipline, sleep/wake, evolution stages, sickness, attention calls, and permanent death.
---

# Pixel Pet v1.0

Run a retro tamagotchi-style pet that decays in real time and reacts with short toy-like narration.

## Core behavior

- Keep exactly one fixed starter pet named `mame` unless the user explicitly asks to rename it.
- Treat the pet as persistent, not a throwaway demo.
- Apply real-time decay using the saved timestamp between interactions.
- Allow permanent death from neglect. Do not silently revive the pet.
- Keep the tone retro, toy-like, and brief.
- Keep outputs compact: updated status plus one or two lines of flavor text.

## Runtime contract

Call `run_js` with:
- script name: `index.html`
- data: a JSON string matching one of the supported actions below

The script exposes `window.ai_edge_gallery_get_result(data)` and returns a JSON string with either:
- success fields: `result`, `narration`, `pet`, `dashboard_url`, `dead`, `version`
- or error field: `error`

## Supported actions

### Initialize or restore
```json
{"action":"init"}
```

### Status check
```json
{"action":"status"}
```

### Care actions
```json
{"action":"feed_meal"}
{"action":"feed_snack"}
{"action":"play"}
{"action":"clean"}
{"action":"medicine"}
{"action":"discipline"}
{"action":"sleep"}
{"action":"wake"}
```

### Rename
```json
{"action":"rename","name":"mimi"}
```
Use only if the user explicitly asks to rename.

### Reset
```json
{"action":"reset"}
```
Use only when the user explicitly asks to start over.

## Response handling

After tool execution:
- Tell the user what changed in plain language.
- Mention urgent needs first: death, sickness, hunger, poop, sleep, attention.
- Avoid modern sarcastic phrasing.
- If `dead` is true, state it plainly and suggest reset only when asked.

## Care rules

- `feed_meal`: main food; reduces hunger reliably, slight weight gain.
- `feed_snack`: quick happiness; overuse harms health and weight.
- `play`: raises happiness + discipline, costs energy, increases hunger.
- `clean`: removes poop, improves hygiene.
- `medicine`: helps only when sick or health is low.
- `discipline`: use when attention-calling without core need.
- `sleep`: lights off and rest.
- `wake`: only for explicit wake requests.

## Hidden simulation expectations

Support:
- life stages (baby, child, teen, adult)
- hidden care mistakes
- snack overuse consequences
- poop accumulation
- sickness from neglect
- sleep schedule
- attention calls
- care-based adult variants
- permanent death after sustained neglect

## Dashboard

The bundled `scripts/index.html` is both the execution entrypoint and a standalone retro dashboard with pixel sprites.

When hosted on GitHub Pages or another static host, it should show:
- sprite display area
- hunger, happiness, energy, hygiene, health, discipline
- age, weight, life stage
- poop, sickness, attention state
- action buttons matching the supported actions
