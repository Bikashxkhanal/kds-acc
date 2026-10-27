# Production PDF setup

Invoice and payment receipt PDFs are rendered by Puppeteer in the `bs` API
service. Keep `puppeteer` in `dependencies` and install production dependencies
with Puppeteer's browser install step enabled so its matching Chrome for Testing
binary is present (do not set `PUPPETEER_SKIP_DOWNLOAD=true`). The API runtime
must allow Chromium to execute and provide its shared system libraries and
fonts. The renderer launches Chrome with `--no-sandbox` and
`--disable-setuid-sandbox`, as required by typical container and managed hosting
runtimes. If Chrome is installed separately, set `PUPPETEER_EXECUTABLE_PATH` to
its executable path. No writable application directory is required; PDFs are
created in memory and sent directly in the response.

PDF failures are logged with a `[pdf]` prefix in the API server logs and return
a user-visible error. The invoice is rendered as A4; payment receipts are
rendered as 8.5 × 5.5 inch landscape pages.
