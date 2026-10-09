# SkillBridge

SkillBridge has two deployable apps:

- `server/`: Express API backed by MongoDB
- `client/`: React and Vite frontend

## Run locally

1. In `server/`, run `npm install`.
2. Copy `server/.env.example` to `server/.env` and set `MONGO_URI` and `JWT_SECRET`.
3. Start the API with `npm run dev` from `server/`.
4. In `client/`, run `npm install` and `npm run dev`. Leave `VITE_API_URL` empty to use the Vite `/api` proxy.

## Accounts
- **Admin:** the first admin can sign up freely. Set `ADMIN_SIGNUP_CODE` in `server/.env` to require a code for later admin signups.
- **Student:** an admin registers the student, who then logs in with their Student ID.

## Deploy the API to Render

1. Create a MongoDB Atlas database and allow Render network access in Atlas Network Access. Atlas documents `0.0.0.0/0` for broad access; restrict this where practical.
2. Create a Render Web Service from this repository, with Root Directory `server`, Build Command `npm install`, and Start Command `npm start`. Alternatively, create a Blueprint using `render.yaml`.
3. Set `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL` in Render. `CLIENT_URL` can temporarily be a placeholder until Vercel provides the frontend URL.
4. Deploy and note the service URL, such as `https://your-api.onrender.com`.

## Deploy the frontend to Vercel

1. Import this repository into Vercel and set Root Directory to `client`.
2. Vercel should detect Vite; the build command is `npm run build` and the output directory is `dist`.
3. Set `VITE_API_URL` to the Render service origin, without a trailing slash or `/api`, such as `https://your-api.onrender.com`.
4. Deploy and note the Vercel URL.

## Connect the deployments

Set Render's `CLIENT_URL` to the exact Vercel origin, with `https://` and no trailing slash, then redeploy the Render service. The API uses bearer tokens, so it does not require cookie credentials.

If you change `VITE_API_URL`, redeploy the Vercel project because Vite embeds it at build time. Render's free tier may sleep after inactivity, so the first request can take longer.
