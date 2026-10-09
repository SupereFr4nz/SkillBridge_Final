<<<<<<< HEAD
# SkillBridge

Two separate apps:

- `server/`: Express API + MongoDB (Mongoose)
- `client/`: React (Vite) website

## Run locally (two terminals)
**Server**
1. `cd server`, then `npm install`
2. Copy `.env.example` to `.env` and fill in `MONGODB_URI` and `JWT_SECRET`
3. `npm run dev` (should print "MongoDB connected")
4. Optional sample data: `npm run seed`

**Client**
1. `cd client`, then `npm install`
2. `npm run dev`, then open the address it prints

## Accounts
- **Admin:** open the site, choose Admin, click Create Account. The first admin can sign up freely.
  After that, sign up needs `ADMIN_SIGNUP_CODE` (set it in `server/.env`), otherwise it closes.
- **Student:** no sign up. An admin adds the student (Students page, Add new student), then the student
  logs in on the Student tab with just their Student ID.

## Deploy
1. **Database:** MongoDB Atlas (free cluster, database user, allow network access).
2. **Server (Render, Railway, etc.):** root directory `server`, build `npm install`, start `npm start`.
   Set `MONGODB_URI`, `JWT_SECRET`, `APP_TIMEZONE`, `ADMIN_SIGNUP_CODE`, and `CLIENT_ORIGIN` (your client's address).
3. **Client (Vercel, Netlify):** root directory `client`, build `npm run build`, output `dist`.
   Set `VITE_API_URL=https://your-server-address/api`.
=======
# SkillBridge_Final
>>>>>>> 4e97617402c14611113bf6d6f7f48b89825d34c6
