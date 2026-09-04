# 🚀 Viewer Social - Online Server & App Deployment Guide

This guide provides instructions to host and deploy the **Viewer Social** web app, backend server, database, and connect your native mobile app (Capacitor Android/iOS) to the live online server.

---

## 📋 Table of Contents
1. [Option 1: Deploy on Vercel (Recommended for Cloud Serverless)](#option-1-deploy-on-vercel)
2. [Option 2: Deploy with Docker & Docker Compose (Self-Hosted / VPS)](#option-2-deploy-with-docker--docker-compose)
3. [Option 3: Deploy on Railway or Render](#option-3-deploy-on-railway-or-render)
4. [Setting Up Nginx Reverse Proxy & SSL (For VPS)](#setting-up-nginx-reverse-proxy--ssl)
5. [📱 Connecting the Mobile App (Capacitor) to Your Online Server](#-connecting-the-mobile-app-to-your-online-server)
6. [🔍 Verification & Health Checks](#-verification--health-checks)

---

## Option 1: Deploy on Vercel

Vercel is the easiest, zero-configuration hosting platform for Next.js applications.

### 1. Database Setup (Cloud PostgreSQL)
Because Vercel serverless functions are stateless, use a hosted PostgreSQL instance:
- **Free Recommended Options**:
  - [Neon Database](https://neon.tech) (Free tier serverless PostgreSQL)
  - [Supabase](https://supabase.com) (Free tier PostgreSQL)
  - [Railway](https://railway.app) (Free trial PostgreSQL)

Create a database and copy your connection string:
```
postgresql://user:password@ep-cool-project.region.neon.tech/viewer?sslmode=require
```

### 2. Import to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in.
2. Click **"Add New Project"** and connect your GitHub repository:
   `asterexplorer/viewer-social`
3. Framework Preset: **Next.js** (detected automatically).
4. Under **Environment Variables**, add:
   - `DATABASE_URL`: Your PostgreSQL connection string.
   - `NEXT_PUBLIC_APP_URL`: Your Vercel domain (e.g. `https://viewer-social.vercel.app`).
   - `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER` (from [Pusher.com](https://pusher.com)).
   - `NEXT_PUBLIC_PUSHER_KEY`, `NEXT_PUBLIC_PUSHER_CLUSTER`.
   - `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET_NAME` (for media uploads).
5. Click **"Deploy"**.

### 3. Initialize Database Schema
From your local terminal, push the schema to your remote cloud database:
```bash
# In your local project with your remote DATABASE_URL in .env:
npx prisma db push
```

---

## Option 2: Deploy with Docker & Docker Compose

Deploy the complete stack (Next.js web app, PostgreSQL, Redis, and persistent volumes) on any VPS (AWS EC2, DigitalOcean Droplet, Hetzner, Linode, Ubuntu server).

### 1. Prerequisites on VPS
Ensure Docker and Docker Compose are installed on your server:
```bash
# Ubuntu / Debian install:
sudo apt update && sudo apt install -y docker.io docker-compose-v2
sudo systemctl enable docker && sudo systemctl start docker
```

### 2. Clone Repository & Configure Environment
```bash
git clone https://github.com/asterexplorer/viewer-social.git
cd viewer-social

# Copy production environment template:
cp .env.production.example .env

# Edit environment variables:
nano .env
```
Ensure you update:
- `NEXT_PUBLIC_APP_URL` (e.g., `https://viewer.yourdomain.com` or `http://YOUR_SERVER_IP:3000`)
- `POSTGRES_PASSWORD` (choose a strong password)

### 3. Launch the Stack
```bash
# Build and start all services in detached mode:
docker compose up -d --build
```

### 4. Push Database Schema & Seed (First Run)
```bash
# Run Prisma schema push inside the web container:
docker compose exec app npx prisma db push

# Optional: seed initial data
docker compose exec app npx prisma db seed
```

### 5. Managing the Service
```bash
# View live logs:
docker compose logs -f app

# Stop the services:
docker compose down

# Restart after code update:
git pull
docker compose up -d --build
```

---

## Option 3: Deploy on Railway or Render

Both platforms provide native Dockerfile and GitHub support:

1. **Railway**:
   - Create a project at [railway.app](https://railway.app).
   - Add a **PostgreSQL** service.
   - Add a **GitHub Repo** service pointing to `asterexplorer/viewer-social`.
   - Railway will build using the included `Dockerfile` or Nixpacks.
   - Under Variables, link `DATABASE_URL` to the Postgres service.

2. **Render**:
   - Create a **Web Service** at [render.com](https://render.com).
   - Connect repo, select Docker runtime, set port `3000`.

---

## Setting Up Nginx Reverse Proxy & SSL

If hosting on your own VPS with a domain name, use Nginx and Let's Encrypt for free HTTPS:

### 1. Install Nginx & Certbot
```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

### 2. Nginx Site Configuration
Create `/etc/nginx/sites-available/viewer`:
```nginx
server {
    server_name viewer.yourdomain.com;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the configuration and reload:
```bash
sudo ln -s /etc/nginx/sites-available/viewer /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Generate Free SSL Certificate
```bash
sudo certbot --nginx -d viewer.yourdomain.com
```

---

## 📱 Connecting the Mobile App to Your Online Server

Once your server is online, configure the mobile Capacitor build to talk to it:

### 1. Set the Server URL
In your project directory or `.env`:
```bash
# Set your live production server address:
CAPACITOR_SERVER_URL="https://viewer.yourdomain.com"
```
Or edit [`capacitor.config.ts`](file:///c:/Users/aster/Documents/viewer-social/capacitor.config.ts):
```typescript
server: {
  url: 'https://viewer.yourdomain.com',
  cleartext: false
}
```

### 2. Sync Native Platforms
```bash
npx cap sync android
```

### 3. Build the Release APK (Android)
From Android Studio:
- Open the `android/` folder in Android Studio.
- Go to **Build > Generate Signed Bundle / APK**.
- Choose **APK**, select your keystore (or create a new one), and select **Release**.

Or build via command line:
```bash
cd android
./gradlew assembleRelease
# The APK will be in: android/app/build/outputs/apk/release/app-release-unsigned.apk
```

---

## 🔍 Verification & Health Checks

Verify your deployment is operational:

1. **System Health**:
   Visit: `https://your-domain.com/api/health`
   Expected response:
   ```json
   {
     "status": "online",
     "message": "Database linked with success!",
     "timestamp": "2026-09-05T00:40:00.000Z"
   }
   ```

2. **API Status**:
   Visit: `https://your-domain.com/api/status`

3. **Feed & Stories**:
   Load the homepage `https://your-domain.com` and test creating a post or story.
