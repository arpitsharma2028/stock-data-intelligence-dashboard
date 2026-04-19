# Stock Data Intelligence Dashboard

A full-stack, responsive financial data platform that fetches, processes, and visualizes **NSE stock market data in real time**. Built with **FastAPI, SQLite, and Vanilla JavaScript**, the platform goes beyond basic charting with **Monte Carlo-based price forecasting** and multi-stock comparative analysis.

**Live Demo:** https://stock-dashboard-nro3.onrender.com
**Live (local):** `http://127.0.0.1:8000`  
**Repository:** https://github.com/arpitsharma2028/stock-data-intelligence-dashboard
**Demo Video:** https://drive.google.com/file/d/1cDFAWIWHKVbR9yOfQzoxAe0kr4pJUUap/view?usp=drivesdk
---

## Features

| Feature | Description |
|---|---|
| **Real-Time Data** | Live NSE market data fetched via **Yahoo Finance (yfinance)** with a graceful mock-data fallback |
| **Monte Carlo Forecasting** | Geometric Brownian Motion over 100 simulations → 14-day probability cone (5th / 50th / 95th percentile) |
| **Interactive Charts** | Chart.js — animated closing price + 7-day MA line chart, coloured daily-return bar chart |
| **Stock Comparison** | Base-100 normalised performance chart + Pearson correlation between any two stocks |
| **Responsive UI** | Dark-themed, mobile-first design with off-canvas sidebar and skeleton loaders |
| **DB Caching** | SQLite caching layer (auto-created on first run) to speed up repeated requests and avoid rate-limiting |
| **Gainers / Losers** | Live snapshot of today's top 3 gainers and losers across all tracked companies |
| **Docker Ready** | Included `Dockerfile` for one-command containerised deployment |

---

## Tech Stack

**Backend:** Python · FastAPI · SQLite · Pandas · NumPy · yfinance  
**Frontend:** HTML · Vanilla CSS · Vanilla JavaScript · Chart.js  
**DevOps:** Docker · Uvicorn

---

## Project Structure

```text
stock-data-intelligence-dashboard/
│
├── README.md
└── stock_dashboard/           # Main application folder
    ├── app/                   # FastAPI backend package
    │   ├── __init__.py
    │   ├── main.py            # App entry point, middleware & startup
    │   ├── database.py        # SQLite connection & schema init
    │   ├── services.py        # yfinance fetch, metric computation, caching
    │   └── routers.py         # All API route handlers
    ├── static/                # Frontend (index.html, style.css, script.js)
    ├── Dockerfile             # Docker container definition
    └── requirements.txt       # Pinned Python dependencies
```
---

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/arpitsharma2028/stock-data-intelligence-dashboard.git
cd stock-data-intelligence-dashboard
```

### 2. Install dependencies

```bash
cd stock_dashboard
pip install -r requirements.txt
```

### 3. Run the server

```bash
# Run from inside the stock_dashboard/ directory
python -m uvicorn app.main:app --reload
```

### 4. Open the dashboard

```
http://127.0.0.1:8000
```

Swagger API docs are auto-generated at `http://127.0.0.1:8000/docs`.

---

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/companies` | GET | List all supported companies with name and sector |
| `/data/{symbol}` | GET | Historical OHLCV + daily return + 7-day MA (configurable window via `?days=`) |
| `/summary/{symbol}` | GET | 52-week high/low, average close, annualised volatility score, top 3 best/worst days |
| `/forecast/{symbol}` | GET | 14-day Monte Carlo probability cone (upper / median / lower bounds) |
| `/compare` | GET | Normalised (Base-100) performance comparison + Pearson correlation for two stocks |
| `/gainers-losers` | GET | Today's top 3 gainers and losers across all tracked stocks |
| `/refresh/{symbol}` | POST | Force re-fetch latest data from yfinance for a specific symbol |

> All endpoints are fully documented with descriptions and parameter validation in the interactive Swagger UI at `/docs`.

---

## Supported Stocks

| Symbol | Company | Sector |
|---|---|---|
| RELIANCE | Reliance Industries | Energy |
| TCS | Tata Consultancy Services | IT |
| INFY | Infosys | IT |
| HDFCBANK | HDFC Bank | Banking |
| ICICIBANK | ICICI Bank | Banking |
| WIPRO | Wipro | IT |
| SBIN | State Bank of India | Banking |
| TATAMOTORS | Tata Motors | Automobile |
| BAJFINANCE | Bajaj Finance | Finance |
| ADANIENT | Adani Enterprises | Conglomerate |

---

## Calculated Metrics

| Metric | Formula / Method |
|---|---|
| **Daily Return** | `(Close − Open) / Open × 100` |
| **7-day Moving Average** | Rolling mean of closing price over 7 days |
| **52-week High / Low** | Max / Min of the last 365 days of data |
| **Volatility Score** | Annualised standard deviation of daily returns: `std(returns) × √252` |
| **Correlation** | Pearson correlation of daily returns between two selected stocks |
| **Monte Carlo Forecast** | Geometric Brownian Motion: `S(t+1) = S(t) × exp((μ − σ²/2) + σε)`, 100 paths |

---

## Author

**Arpit Sharma**  
📧 Contact via GitHub — [arpitsharma2028](https://github.com/arpitsharma2028)

---

## Show Your Support

If you found this project useful, give it a ⭐ on GitHub and share it with others!
