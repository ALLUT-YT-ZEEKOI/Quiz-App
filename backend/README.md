# CohesionTech API (Node.js + Express + MongoDB)

The backend for the CohesionTech app. It stores everything in MongoDB so all students and the admin see the same data on any device:

- Student registration and login (bcrypt passwords, JWT sessions); admin login
- Subjects, modules, sections, videos, notes, questions
- Subscriptions and payment approvals, live exams, retests, doubts, results
- Note files (PDF, slides, images) in MongoDB GridFS

Security rules are enforced on the server:

- Students see only their own attempts, subscriptions, doubts and retests.
- Students never receive exam answers before they attempt an exam.
- Unpaid subjects don't send their video links, notes or quiz questions.
- Exam and quiz scores are recalculated on the server, so they can't be faked.
- Only the admin can approve payments, grant retests or edit content.

---

## 1. Create the database (MongoDB Atlas, free)

You're on step 1 of creating a project. Continue like this:

1. **Name Your Project:** `Cohesion`, then **Next**, then **Create Project**.
2. **Create a cluster.** Click **Create** (or **Build a Database**) and choose:
   - **Free (M0)**.
   - Provider: any. Region: the closest to India, e.g. **Mumbai (ap-south-1)**.
   - Name: `Cluster0`.

   Then click **Create Deployment**.
3. **Create a database user.** In the "Connect to Cluster0" pop-up:
   - Username: `cohesion_app`.
   - Click **Autogenerate Secure Password** and **copy the password somewhere safe**.
   - Click **Create Database User**.
4. **Allow connections.** Go to **Security → Network Access → Add IP Address**:
   - For local testing: **Add Current IP Address**.
   - For a hosted backend (Render etc.): add `0.0.0.0/0` ("Allow access from anywhere"). Your database user's password still protects the data.
5. **Get the connection string.** Go to **Database → Connect → Drivers → Node.js** and copy the string. It looks like:
   ```
   mongodb+srv://cohesion_app:<db_password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```
   Replace `<db_password>` with the password from step 3.

You don't need to create collections. The API creates them automatically (`users`, `curriculum_subjects`, `exam_attempts`, …).

## 2. Run the API on your computer

```bash
cd backend
npm install
cp .env.example .env        # Windows PowerShell: copy .env.example .env
```

Open `backend/.env` and fill in:

| Setting | What to put |
|---|---|
| `MONGODB_URI` | The connection string from step 1.5 |
| `JWT_SECRET` | A long random string. Generate one with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `CLIENT_ORIGINS` | `http://localhost:3000` (add your live site URL later, comma-separated) |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Your admin login. The password needs at least 8 characters. |

Start it:

```bash
npm run dev          # restarts automatically when you change code
```

You should see `✅ Admin account created` and `🚀 CohesionTech API running on http://localhost:5000/api`.
Check it at http://localhost:5000/api/health.

> **No Atlas yet?** `npm run dev:memory` starts the API with a temporary in-memory database (admin: `admin` / `admin12345`). Data disappears when you stop it.

## 3. Connect the frontend

In the **project root** (next to the root `package.json`), create `.env.local`:

```
VITE_API_URL=http://localhost:5000/api
```

Restart the frontend (`npm run dev`). The app now uses the backend:

- The login screen shows only real logins (no demo accounts).
- Sign in as admin with `ADMIN_USERNAME` / `ADMIN_PASSWORD`.
- **First time only:** a banner says *"Your online database is empty"*. Click **Upload my existing data** in the browser you've been using. It copies the subjects, videos, notes, exams, students, results and student registrations saved in that browser to MongoDB. Registered students keep their passwords. Click **Start empty** instead if you want a clean start.

Remove `VITE_API_URL` to go back to the browser-only version at any time.

## 4. Put it online

### Backend: Render (free)
1. Push the project to GitHub (`.env` files are ignored, so your secrets stay private).
2. On https://render.com, go to **New → Web Service** and pick the repo.
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. Under **Environment**, add the same variables as your `.env`. Set `CLIENT_ORIGINS` to your Vercel URL, e.g. `https://cohesiontech.vercel.app`.
4. After deploying you get a URL like `https://cohesion-api.onrender.com`. Test `https://cohesion-api.onrender.com/api/health`.

On the free plan, the service sleeps after ~15 minutes without traffic, and the first request after that takes ~30 seconds.

### Frontend: Vercel (already set up)
In the Vercel project, go to **Settings → Environment Variables** and add:

```
VITE_API_URL = https://cohesion-api.onrender.com/api
```

Then redeploy.

## 5. Everyday admin tasks

- **Change the admin password:** change `ADMIN_PASSWORD` (locally in `.env`, or in Render's environment) and restart the API.
- **A student forgot their password:** go to **Registered Students**, open the student, **Reset password**, then send it on WhatsApp. They choose a new password at their next login.
- **Back up data:** in Atlas, go to **Database → Browse Collections**. Atlas also has export tools (`mongodump`).

## API overview

| Method & path | Who | Purpose |
|---|---|---|
| `POST /api/auth/register` | public | Student registration form |
| `POST /api/auth/login` | public | Login (student: email / WhatsApp / registration ID; admin: username/email) |
| `POST /api/auth/set-password` | reset token | New password after an admin reset |
| `GET /api/auth/me` | signed in | Current user |
| `POST /api/auth/change-password` | signed in | Change own password |
| `GET /api/sync/bootstrap` | signed in | All data the user may see |
| `GET /api/sync/changes?since=` | signed in | Changes since a time (polled every 15s) |
| `POST /api/sync/:collection` | signed in | Save changed items (rules applied per role) |
| `POST /api/exams/:id/submit` | student | Submit a live exam (scored on the server) |
| `PUT/GET/DELETE /api/files/:noteId` | admin / signed in | Note files |
| `POST /api/admin/import` | admin | One-time import of browser data |
| `POST /api/admin/students/:id/reset-password` | admin | Temporary password for a student |
