# Edge Gallery notes (researched from `google-ai-edge/gallery`)

This skill follows the Agent Skills guidance in `gallery/skills/README.md`.

## Required structure

For JS skills, use:

- `SKILL.md` at skill root
- `scripts/index.html` as JS entrypoint

## Runtime requirements

- Expose an async function on `window` named `ai_edge_gallery_get_result`.
- Parse incoming `data` (stringified JSON).
- Return a stringified JSON object.
- Return either a `result` field on success or `error` on failure.

## SKILL.md guidance used

- Frontmatter must include `name` and `description`.
- Instructions should explicitly tell the model to call `run_js` and define the JSON payload schema.

## Add skill in app

Based on the repository docs, skills can be loaded in AI Edge Gallery by:
1. Community-featured skills
2. URL loading
3. Local file import

## Hosting notes

For URL loading, host the skill folder on a static host where `SKILL.md` and `scripts/index.html` are directly reachable over HTTPS.
