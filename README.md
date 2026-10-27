# Production PDF setup

Invoice and payment receipt PDFs are rendered by Puppeteer in the `bs` API
service. On Render, set the service Root Directory to `bs`, Build Command to
`npm ci && npx puppeteer browsers install`, and Start Command to
`npm start`. The checked-in `bs/.puppeteerrc.cjs` puts Puppeteer's matching
Chrome for Testing browser in `bs/.cache/puppeteer`, inside the deployed
project, so the build and runtime use the same browser path. Do not set
`PUPPETEER_SKIP_DOWNLOAD=true`; Puppeteer's install step and explicit browser
install command must be allowed to download Chrome. Keep `puppeteer` in
`dependencies`.

The API runtime must allow Chromium to execute and provide its shared system
libraries and fonts. The renderer launches Chrome with `--no-sandbox`,
`--disable-setuid-sandbox`, and `--disable-dev-shm-usage`, as required by typical
container and managed hosting runtimes. If Chrome is installed separately,
`PUPPETEER_EXECUTABLE_PATH` can point to its executable path. PDFs are created
in memory and sent directly in the response.

PDF failures are logged with a `[pdf]` prefix in the API server logs and return
a user-visible error. The invoice is rendered as A4; payment receipts are
rendered as 8.5 × 5.5 inch landscape pages.
