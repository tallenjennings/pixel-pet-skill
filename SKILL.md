---
name: pixel-pet
description: retro 90s tamagotchi-style virtual pet with real-time care, fixed starter pet, evolution, sickness, discipline, sleep, and permanent death. use when the user wants to raise, check, feed, play with, clean, medicate, discipline, or put a pet to sleep inside google ai edge gallery or another js-skill runtime that supports run_js with scripts/index.html.
---

# Pixel Pet

Run a retro tamagotchi-style pet that decays in real time and reacts with short toy-like narration.

## Core behavior

- Keep exactly one fixed starter pet named `mame` unless the user explicitly asks to rename it.
- Treat the pet as a persistent creature, not a throwaway demo.
- Apply real-time decay using the saved timestamp between interactions.
- Allow permanent death from neglect. Do not silently revive the pet.
- Keep the tone retro, toy-like, and brief. Prefer short cues such as `MEEP!`, `...`, `It looks hungry.`, `It beeped for attention.`
- Keep outputs compact. Show the updated status and one or two lines of flavor text.

## Runtime

Call `run_js` with:
- script name: `index.html`
- data: a JSON string matching one of the actions below

## Supported actions

### Initialize or restore
```json
{"action":"init"}
```
Creates the fixed pet if none exists, otherwise restores the saved state.

### Status check
```json
{"action":"status"}
```
Returns the current state after applying real-time decay.

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
Only use if the user explicitly wants a different pet name.

### Reset
```json
{"action":"reset"}
```
Use only when the user explicitly asks to start over. This permanently replaces the current pet.

## Response handling

The script returns a JSON string with fields such as:
- `result`: short machine-readable summary
- `narration`: short retro pet text for the user
- `pet`: full current state
- `dashboard_url`: relative URL to the same page for the visual dashboard
- `dead`: whether the pet has died

After tool execution:
- Tell the user what changed in plain language.
- Mention urgent needs first: death, sickness, hunger, poop, sleep, attention call.
- Avoid modern sarcastic phrasing.
- If `dead` is true, state it plainly and only suggest reset if the user asks what to do next.

## Care rules

- `feed_meal` is the main food. It reduces hunger reliably and slightly increases weight.
- `feed_snack` boosts happiness quickly but too many snacks worsen health and weight.
- `play` increases happiness and discipline slightly, but costs energy and increases hunger.
- `clean` removes poop and improves hygiene.
- `medicine` helps only when sick or health is low.
- `discipline` is appropriate when the pet is calling for attention without a core need.
- `sleep` turns lights off and lets the pet rest.
- `wake` is for explicit wake-up requests only.

## Hidden simulation expectations

The pet should support:
- life stages: baby, child, teen, adult
- hidden care mistakes
- snack overuse consequences
- poop accumulation
- sickness from neglect
- sleep schedule
- attention calls
- care-based evolution
- permanent death after sustained neglect

## Dashboard

The bundled `scripts/index.html` is also a standalone dashboard page.
When hosted on GitHub Pages or another static host, it should show:
- pet sprite area
- hunger, happiness, energy, hygiene, health, discipline
- age, weight, life stage
- poop, sickness, attention state
- action buttons matching the supported actions

If the runtime can show a webview, use the returned `dashboard_url`. Otherwise rely on chat narration and state updates.
