# 📈 Stock Data Intelligence Dashboard
> JarNox Software Internship Assignment

A mini financial data platform that collects, cleans, analyses, and visualises real Indian stock market data (NSE) using Python, FastAPI, SQLite, and Chart.js.

---

## 🗂️ Project Structure

```
stock_dashboard/
├── main.py              ← FastAPI backend (all API endpoints)
├── stocks.db            ← SQLite database (auto-created on first run)
├── requirements.txt
├── static/
│   └── index.html       ← Full interactive frontend dashboard
└── README.md
```

---

## ⚙️ Setup & Run

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Start the server
```bash
uvicorn main:app --reload
```

### 3. Open the dashboard
```
http://localhost:8000
```

### 4. Interactive API docs (Swagger UI)
```
http://localhost:8000/docs
```

---

## 🔌 API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/companies` | GET | List of all tracked companies |
| `/data/{symbol}?days=30` | GET | Last N days of OHLCV + metrics |
| `/summary/{symbol}` | GET | 52-week high/low, avg, volatility, best/worst days |
| `/compare?symbol1=INFY&symbol2=TCS&days=30` | GET | Normalised performance comparison + correlation |
| `/gainers-losers` | GET | Top 3 gainers and losers (latest day) |
| `/refresh/{symbol}` | POST | Force re-download data from yfinance |

---

## 📊 Data & Metrics

**Source:** Yahoo Finance (yfinance) — NSE listed stocks

**Tracked companies:** RELIANCE, TCS, INFY, HDFCBANK, ICICIBANK, WIPRO, SBIN, TATAMOTORS, BAJFINANCE, ADANIENT

**Computed metrics:**
- `daily_return` = (CLOSE − OPEN) / OPEN × 100
- `ma7` = 7-day rolling moving average of close price
- `52_week_high/low` = annual price extremes
- `avg_close` = mean closing price (52 weeks)
- `volatility_score` = annualised std deviation of daily returns (σ × √252)
- `correlation` = Pearson correlation of daily returns between two stocks

---

## 🧠 Creative Additions

1. **Volatility Score** — annualised volatility using standard deviation × √252, a metric used in real-world portfolio risk assessment.
2. **Stock Correlation** — compares how two stocks move together (useful for diversification decisions).
3. **Normalised Performance Chart** — rebases both stocks to 100 so you can fairly compare differently-priced stocks over time.
4. **Top Gainers/Losers** — dashboard-level market overview based on latest daily return.

---

## 🎨 Frontend Features

- Dark-themed responsive dashboard
- Left sidebar with all companies
- Period selector (30 / 60 / 90 / 180 / 365 days)
- Closing price + 7-day MA line chart
- Daily return bar chart (green/red)
- Stock comparison widget (normalised, with correlation display)
- Top Gainers / Losers panel

---

## 🚀 Optional Deployment

Deploy for free on **Render**:

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Set:
   - **Build command:** `pip install -r requirements.txt`
   - **Start command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`

---

## 📬 Submission

Submitted to: support@jarnox.com  
Author: [Your Name]  
GitHub: [your-repo-url]
