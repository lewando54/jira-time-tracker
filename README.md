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

## Using the app

Open the live URL, click the Settings icon in the header and enter:

- **Space URL** — your Jira Cloud URL, e.g. `https://your-domain.atlassian.net`
- **Email** — your Atlassian account email
- **API Token** — generate one at https://id.atlassian.com/manage-profile/security/api-tokens

Credentials are stored only in your browser's localStorage. They are sent directly to your Jira instance via the CORS proxy and never stored anywhere else.

## Local development

```bash
npm install
npm run dev
```

No `.env` needed — credentials are entered in the app's Settings screen. The Vite dev server handles the Jira proxy automatically.

## Deployment

The app consists of two parts:
1. **Static frontend** — deployed to GitHub Pages via GitHub Actions
2. **CORS proxy** — a small Vercel serverless function that forwards requests to Jira

### Step 1 — Deploy the proxy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from the proxy directory
cd proxy
vercel
```

Follow the prompts — choose your personal account, create a new project named `jira-time-tracker-proxy`. When it asks for the root directory, confirm it's `proxy/`.

Note the deployment URL: `https://jira-time-tracker-proxy-<hash>.vercel.app`

For a stable URL without the hash, go to the Vercel dashboard, open the project, and set a custom project name — then your URL will be `https://jira-time-tracker-proxy.vercel.app`.

### Step 2 — Add the GitHub secret

In your GitHub repo: **Settings → Secrets and variables → Actions → New repository secret**

- Name: `VITE_PROXY_URL`
- Value: your Vercel deployment URL (e.g. `https://jira-time-tracker-proxy.vercel.app`)

### Step 3 — Enable GitHub Pages

In your GitHub repo: **Settings → Pages → Source → GitHub Actions** → Save.

### Step 4 — Push and deploy

```bash
git push origin main
```

GitHub Actions will build and deploy automatically. The app will be live at:
`https://lewando54.github.io/jira-time-tracker/`

## Stack

| Concern | Library |
|---------|---------|
| UI Framework | React 19 + TypeScript |
| Build | Vite 8 |
| State | Zustand 5 |
| Data fetching | Axios + TanStack React Query 5 |
| UI components | Radix UI primitives |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| i18n | react-i18next (EN + PL) |
| Dates | date-fns |
| Toasts | Sonner |
| CORS proxy | Vercel Serverless Functions |
