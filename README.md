# INE Product Price Tracker

A full-stack web application for monitoring and tracking product price fluctuations from INE's store. Built with React.js, Node.js Express, Playwright browser automation, and Supabase PostgreSQL with local database fallback capabilities.

---

## Key Features

- **Automated Web Scraping Engine**: Uses Playwright browser automation to extract prices and stock availability from store pages.
- **Multi-Layer Scraper Reliability**: Three-stage exponential backoff retry mechanism (2s, 4s, 8s delays) to handle network latency and server hiccups.
- **Strict Data Validation**: Drops invalid numbers and prevents NaN or null values from corrupting historical metric graphs.
- **Dual Audit Log and Metrics Persistence**: Records valid price and stock metrics in `scrape_records` and attempt events in `scrape_logs`.
- **Human-Designed SaaS UI**: Clean, responsive, modern dashboard built with Tailwind CSS, Lucide icons, and Recharts line charts.
- **CSV Data Export**: One-click generation and download of aggregated price history records.
- **External Cron Integration**: Endpoint secured via `X-Cron-Secret` header for automated 2-hour cron job triggers via cron-job.org.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Recharts, Lucide Icons |
| **Backend** | Node.js, Express.js, Playwright Browser Automation |
| **Database** | Supabase (PostgreSQL) / SQLite3 Local Fallback |
| **Scheduling** | External Cron Trigger (cron-job.org) |
| **Deployment** | Vercel (Frontend), Render (Backend) |

---

## Quick Start (Local Development)

### 1. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

Create `.env` files based on the `.env.example` templates provided:

**backend/.env**:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
STORE_URL=https://demo.inelabteamdev.com
PORT=5000
NODE_ENV=development
CRON_SECRET=super-secret-cron-token-32-chars-long
USE_LOCAL_DB_FALLBACK=true
```

**frontend/.env**:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed Database

```bash
# Seed initial tracked products and sample historical price points
cd backend
npm run seed
```

### 4. Run Application Locally

```bash
# Terminal 1: Run Backend API Server (Port 5000)
cd backend
npm run dev

# Terminal 2: Run Frontend App (Port 3000)
cd frontend
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Server health check and timestamp |
| `GET` | `/api/search?query=...` | Search catalog products |
| `GET` | `/api/tracks` | List all active tracked products |
| `POST` | `/api/tracks` | Add product option to tracking list |
| `DELETE` | `/api/tracks/:id` | Stop tracking a product |
| `POST` | `/api/scrape/run-now` | Trigger batch scrape for all active products |
| `GET` | `/api/history/:productId` | Get historical price data (`?days=7`) |
| `GET` | `/api/logs/:productId` | Get scrape audit logs (`?limit=50`) |
| `GET` | `/api/export/csv` | Download aggregated CSV file |

---

## Running Headed Scraper Mode (Demo Recording)

To visually watch the Playwright browser navigate and extract prices in real-time:

```bash
cd backend
npm run manual-scrape
```

---

## Production Deployment

### 1. Supabase Setup
Create a PostgreSQL project on Supabase and run the table creation SQL commands. Disable RLS or configure access policies for `tracked_products`, `scrape_records`, and `scrape_logs`.

### 2. Backend Deployment (Render)
1. Create a Web Service on Render pointing to the `backend/` directory.
2. Build Command: `npm install && npx playwright install chromium`
3. Start Command: `npm start`
4. Configure Environment Variables (`SUPABASE_URL`, `SUPABASE_KEY`, `STORE_URL`, `NODE_ENV`, `CRON_SECRET`, `USE_LOCAL_DB_FALLBACK=false`).

### 3. Frontend Deployment (Vercel)
1. Import repository on Vercel and set Root Directory to `frontend`.
2. Set Environment Variable `VITE_API_URL` to your Render backend API endpoint (e.g. `https://your-backend.onrender.com/api`).
3. Deploy.

### 4. Automated Scheduling (cron-job.org)
1. Create a cron job pointing to `https://your-backend.onrender.com/api/scrape/run-now`.
2. Method: `POST`
3. Header: `X-Cron-Secret: super-secret-cron-token-32-chars-long`
4. Schedule: Every 2 hours (`0 */2 * * *`).

---

## License

ISC License
