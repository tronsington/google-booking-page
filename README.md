# Booking App

A simple meeting booking page that integrates with Google Calendar.

## Features
- M-F 9am-5pm availability
- 30 min or 1 hour meeting slots
- Checks your calendar for conflicts
- Creates events and sends invites

## Setup

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable the **Google Calendar API**
4. Create OAuth 2.0 credentials:
   - Go to APIs & Services → Credentials
   - Create OAuth client ID (Web application)
   - Add `http://localhost:3000` to authorized redirect URIs
5. Note your Client ID and Client Secret

### 2. Get Refresh Token

Run this one-time to get your refresh token:

```bash
# Install oauth playground or use Google's OAuth Playground:
# https://developers.google.com/oauthplayground/

# Select Google Calendar API v3 scope
# Exchange authorization code for tokens
# Copy the refresh_token
```

### 3. Environment Variables

Create `.env.local` in the project root:

```
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token
GOOGLE_CALENDAR_ID=your_email@gmail.com
```

### 4. Deploy to Vercel

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## Local Development

```bash
npm install
npm run dev
```

Visit http://localhost:3000
