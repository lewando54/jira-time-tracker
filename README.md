# Jira Time Tracker

A React time tracking dashboard for Jira Cloud. View, add, edit, and delete worklogs in a spreadsheet-style matrix with week/month filtering.

**Live:** https://lewando54.github.io/jira-time-tracker/

## Features

- Spreadsheet matrix — tasks on Y axis, days on X axis
- Weekly and monthly views with period navigation
- Add, edit, delete worklog entries per cell
- Auto-loads issues you have logged time on for the selected period
- Manually pin any Jira issue via search
- Column and row totals with grand total
- English and Polish UI with language switcher
- Dark mode flat design with Lucide icons

## Security & privacy

**This app never stores, transmits, or logs your Atlassian password or API token.**

Authentication uses **OAuth 2.0 (3-Legged OAuth)** — the industry standard used by apps like Slack, Notion, and GitHub when connecting to third-party services. Here's exactly what happens:

1. You click "Connect with Atlassian"
2. You log in on **Atlassian's own domain** (`id.atlassian.com`) — your credentials go directly to Atlassian, never to this app or any server we control
3. Atlassian issues a short-lived access token (valid for 1 hour) directly to your browser
4. That token is stored only in your browser's `localStorage` and used solely to make Jira API requests on your behalf
5. Tokens expire automatically and can be revoked at any time from your [Atlassian account security settings](https://id.atlassian.com/manage-profile/security)

**The CORS proxy** (a small Vercel serverless function) exists only because browsers block direct cross-origin requests to Atlassian's API. It forwards your requests to Jira and returns the response — it sees only an opaque, short-lived Bearer token, never your password or any permanent credential. No request bodies or headers are logged.

## Using the app

Open the live URL and click **Connect with Atlassian**. You'll be redirected to Atlassian's login page, and after approving access you'll be brought back to the dashboard automatically.

To disconnect, click the sign-out icon in the top-right corner at any time.

## Local development

```bash
npm install
```

Create a `.env` file in the project root:

```
VITE_CLIENT_ID=lCoMV7CRQSSjlIvj5ViQ7OIXHianPOBY
VITE_PROXY_URL=https://jira-time-tracker-proxy.vercel.app
```

Then start the dev server:

```bash
npm run dev
```

The Vite dev server proxies Jira API requests locally so no CORS issues occur in development.

## Deployment

The app has two parts:

1. **Static frontend** — deployed to GitHub Pages via GitHub Actions
2. **CORS proxy** — a Vercel serverless function that forwards Jira API requests

### Step 1 — Deploy the proxy to Vercel

```bash
cd proxy
npx vercel --prod
```

Follow the prompts. Set these environment variables in the Vercel dashboard (project → Settings → Environment Variables):

| Name             | Value                                  |
| ---------------- | -------------------------------------- |
| `VITE_CLIENT_ID` | Your Atlassian OAuth app Client ID     |
| `CLIENT_SECRET`  | Your Atlassian OAuth app Client Secret |

The `CLIENT_SECRET` lives **only** on Vercel — it is never exposed to the browser or committed to the repository.

### Step 2 — Add GitHub secrets

In your GitHub repo: **Settings → Secrets and variables → Actions → New repository secret**

| Name             | Value                              |
| ---------------- | ---------------------------------- |
| `VITE_PROXY_URL` | Your Vercel deployment URL         |
| `VITE_CLIENT_ID` | Your Atlassian OAuth app Client ID |

### Step 3 — Enable GitHub Pages

In your GitHub repo: **Settings → Pages → Source → GitHub Actions** → Save.

### Step 4 — Push to deploy

```bash
git push origin main
```

GitHub Actions builds and deploys automatically. The app will be live at:
`https://<your-username>.github.io/jira-time-tracker/`

## Stack

| Concern       | Library                        |
| ------------- | ------------------------------ |
| UI Framework  | React 19 + TypeScript          |
| Build         | Vite 8                         |
| State         | Zustand 5                      |
| Data fetching | Axios + TanStack React Query 5 |
| UI components | Radix UI primitives            |
| Styling       | Tailwind CSS v4                |
| Icons         | Lucide React                   |
| i18n          | react-i18next (EN + PL)        |
| Dates         | date-fns                       |
| Toasts        | Sonner                         |
| Auth          | Atlassian OAuth 2.0 (3LO)      |
| CORS proxy    | Vercel Serverless Functions    |
