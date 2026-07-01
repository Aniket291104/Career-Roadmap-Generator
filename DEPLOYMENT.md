# Deployment Guide & Environment Configuration

This guide provides step-by-step instructions on how to deploy this application to production (Frontend on **Vercel** and Backend on **Render/Railway**) and fix database/registration issues in the cloud.

---

## 1. Configure MongoDB Atlas (Database Whitelisting)
By default, MongoDB Atlas blocks all incoming connections except for whitelisted IP addresses. Since cloud hosting platforms like Render or Vercel use dynamic IP addresses, you must allow access from anywhere:
1. Log in to your [MongoDB Atlas Dashboard](https://cloud.mongodb.com/).
2. Under the **Security** section on the left sidebar, click **Network Access**.
3. Click **Add IP Address**.
4. Choose **Allow Access From Anywhere** (which inputs `0.0.0.0/0`).
5. Click **Confirm** and wait for the status to change to **Active**.

*Note: Without this, your deployed backend server will throw a timeout error when attempting to connect to the database.*

---

## 2. Deploy Express Backend (Render/Railway)
Deploy the Express API server first so that you can get its URL for the frontend.

### Deploying to Render:
1. Create a free account on [Render](https://render.com/).
2. Click **New** -> **Web Service**.
3. Connect your GitHub repository.
4. Set the following details:
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build` (or `npm install && npm run build`)
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add all key-values from your `backend/.env` file:
   - `MONGODB_URI`: *Your MongoDB Atlas connection string*
   - `GEMINI_API_KEY`: *Your Gemini API Key*
   - `PORT`: `10000` (Render binds automatically, but good to have)
   - `NODE_ENV`: `production`
   - `JWT_ACCESS_SECRET`: *A secure random string*
   - `JWT_REFRESH_SECRET`: *A secure random string*
   - `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL`: *Your email settings for OTP verification*
6. Deploy the web service and copy the generated URL (e.g., `https://your-backend.onrender.com`).

---

## 3. Deploy Next.js Frontend (Vercel)
Now deploy the frontend, which will communicate with the deployed backend API.

### Deploying to Vercel:
1. Log in to your [Vercel Dashboard](https://vercel.com/).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. Configure the Project Settings:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `frontend`
5. Click the **Environment Variables** accordion and add the following variable:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://your-backend.onrender.com/api` (Replace with your actual deployed Render backend URL)
6. Click **Deploy**.

---

## 4. Why Localhost Doesn't Work in Production
* **Inaccessible Localhost:** If `NEXT_PUBLIC_API_URL` is omitted, the frontend defaults to `http://localhost:5000/api`. When visiting your site via `https://your-app.vercel.app`, the browser attempts to contact port 5000 on *your computer*, which is not publicly open.
* **Mixed Content Blockers:** Modern browsers prevent secure HTTPS web pages (`https://...vercel.app`) from loading insecure HTTP resources (`http://localhost:5000/api`). The browser blocks the request entirely, causing the registration form to hang or fail.
