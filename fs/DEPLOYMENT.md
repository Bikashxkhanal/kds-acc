# Frontend deployment

The frontend is a Vite single page app. For Vercel, set the project root to `fs`, build command to `npm run build`, and output directory to `dist`. `vercel.json` rewrites direct route requests such as `/login`, `/customers/1`, and `/billings/123` to `index.html`, where React Router handles them. Set `VITE_BASE_URL` to the API origin.

If deploying behind Nginx instead, use `try_files $uri $uri/ /index.html;` in the frontend site's location block. Keep `/api/` proxy routing ahead of the SPA fallback when the API shares the same host.

## Local development and LAN access

Start the API from `bs` with `npm run dev`, then start the frontend from `fs` with `npm run dev -- --host 0.0.0.0`. Vite proxies `/api` to the Express API on the hosting machine; Express continues to connect to the remote database configured by `MONGODB_URI` in `bs/.env`. A browser opened on another device therefore reaches the API through the hosting machine instead of trying that device's own `localhost`. The API loads `bs/.env`, listens on port 8000, and accepts both `CORS_ORIGIN` and `CORS_ORIGIN_NETWORK` for direct API access. Use the variable names in `bs/.env.example`; `MONGO_DB_NAME` is supported for the remote database name.
