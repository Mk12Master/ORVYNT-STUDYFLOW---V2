# ORVYNT StudyFlow V2.0 — Starter

This is a separate V2.0 build. It does not overwrite the live V1.0 site.

## Included
- `index.html`: original StudyFlow planner with a simplified quick-start area and integrated ORVYNT AI chat panel.
- `worker.js`: secure server-side AI proxy. The API key is stored as a Worker secret, never in the website.
- `wrangler.toml`: Cloudflare Worker configuration.
- `README.md`: setup and testing guide.

## Important status
The redesigned planner and chat interface are built. **The AI is not live until the backend is deployed and configured.** Do not publish this as the live homepage until it has been tested.

## Before connecting AI
Ask a parent/guardian to help with any new developer account, terms, billing settings, or API configuration. Check current free-tier and pricing details first. Do not enable paid billing or add a payment method without guardian approval. An AI API may have usage charges and may not have a permanent free tier.

## Backend setup (guardian-assisted)
1. Create a Cloudflare Worker project using the current Cloudflare dashboard or Wrangler instructions.
2. Deploy `worker.js`.
3. Set the Worker variable `ALLOWED_ORIGIN` to the exact website origin, for example `https://mk12master.github.io` (no trailing slash). If your site is on a different hostname, use that exact origin.
4. Add the provider key as a secret named `OPENAI_API_KEY` using the provider's secure secret setting. **Never paste the key into `index.html`, GitHub, chat messages, or screenshots.**
5. Check model availability and pricing before selecting `OPENAI_MODEL`. The default in this starter is `gpt-4.1-mini`.
6. Test the deployed Worker from the website origin. Confirm that an unrelated origin is rejected.

## Connect the frontend
In `index.html`, find:
`const ORVYNT_AI_ENDPOINT = "PASTE_YOUR_WORKER_URL_HERE";`

Replace only the placeholder with the deployed Worker HTTPS URL, for example:
`const ORVYNT_AI_ENDPOINT = "https://your-worker.your-subdomain.workers.dev";`

Do not include `/api/chat` in that value; the frontend adds it automatically.

## Test before publishing
- Open the site on iPad Safari.
- Check each planner tab and existing save/restore behavior.
- Add a harmless test task, refresh, and confirm it remains.
- Export a JSON backup.
- Open Ask ORVYNT and test a simple school question.
- Test a follow-up question in the same chat.
- Test a planner-help question.
- Confirm the API key is not present in page source, repository files, or browser developer tools.
- Only after all tests pass, back up the current `index.html`, then replace the repository homepage with the V2.0 `index.html`.

## Data and privacy
Planner data is stored locally in the browser on that device, as in the original V1 planner. It is not synced to a cloud account. Chat messages are sent to the configured AI backend and AI provider to generate replies. Avoid sending personal details, passwords, school IDs, addresses, or contact information. Review the provider's current data and privacy terms with a parent/guardian.

## Limitations in this starter
- AI cannot read or automatically change planner entries. It only receives messages typed into the chat.
- Chat history is held in the current page session and is not synced across devices.
- The Worker starter has origin checking and input limits, but production deployment should also add suitable rate limiting and usage monitoring before sharing widely.
