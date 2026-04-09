# Edge Gallery notes

This skill is designed around the Google AI Edge Gallery JavaScript skill pattern:
- `SKILL.md` describes the tool contract.
- `scripts/index.html` exposes `window.ai_edge_gallery_get_result(data)`.
- The same `index.html` also doubles as a standalone retro dashboard when hosted.

Recommended hosting:
- GitHub Pages or another static host that serves HTML with the correct MIME type.
- If using GitHub Pages, add `.nojekyll` at the repo root when publishing the containing repository.

Recommended load flow on phone:
1. Host the folder publicly.
2. Verify `.../SKILL.md` loads directly.
3. In Edge Gallery Agent Skills, use `Load skill from URL` and point it at the skill folder.
4. Open the chat and start with `{"action":"init"}` or ask the model to initialize the pet.

Because runtime support for returning an inline webview may vary by app version, the JS returns a `dashboard_url` field as a stable fallback. The same page can be opened directly in a browser when needed.
