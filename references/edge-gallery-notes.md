# Edge Gallery implementation notes (`google-ai-edge/gallery`)

## JS skill contract (confirmed)

From `skills/README.md` and working featured skills (`virtual-piano`, `restaurant-roulette`):

- JS entrypoint must expose `window['ai_edge_gallery_get_result'] = async (dataStr) => { ... }`.
- Input `dataStr` is stringified JSON from `run_js`.
- Return must be a stringified JSON object.
- Success returns should include `result`; failures return `error`.

## Webview/display schema (confirmed from working skills)

Working skills return:

```json
{
  "result": "...",
  "webview": {
    "url": "ui.html?v=...",
    "aspectRatio": 1.0
  }
}
```

Notes:
- `webview.url` can be relative (served from skill assets).
- `aspectRatio` is optional, but included for predictable card rendering.

## Pixel Pet actions used

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

## Sprite source

- Browse page: https://www.spriters-resource.com/lcd_handhelds/tamagotchioriginalp1p2/
- Asset used: General Sprites (Simplified)
- Required local file (user-provided): `scripts/assets/tamagotchi-p1p2-general-sprites.png`
