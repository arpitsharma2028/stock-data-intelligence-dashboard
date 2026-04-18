# 📊 Stock Data Intelligence Dashboard

A full-stack, responsive financial dashboard that fetches, processes, and visualizes stock market data (NSE) in real-time. Built with **FastAPI, SQLite, and Vanilla JavaScript**, this platform goes beyond basic charting by implementing advanced mathematical modeling for price prediction.

🔗 **Live Project (Local):** `http://127.0.0.1:8000/static/index.html`  
📂 **Repository:** https://github.com/arpitsharma2028/stock-data-intelligence-dashboard

---

## 🚀 Features

* 📈 **Real-Time Data Ingestion:** Live market data fetched seamlessly via **Yahoo Finance (yfinance)**.
* 🧠 **AI/ML Price Forecasting (Monte Carlo):** Uses Geometric Brownian Motion to run 100 random future walks based on historical volatility, generating a 95% confidence probability cone.
* 📊 **Interactive Chart.js Visualizations:** Beautiful, animated charts displaying closing prices, 7-day Moving Averages, and daily return percentages.
* 🔄 **Comparative Analysis:** Side-by-side performance normalization (Base 100) to easily compare two different stocks.
* 📱 **Mobile-First Responsive UI:** Custom dark-themed interface with an off-canvas mobile menu, dynamic error handling, and skeleton loaders.
* 💾 **Persistent DB Caching:** Robust SQLite caching layer to dramatically speed up load times and prevent API rate-limiting.

---

## 🛠️ Tech Stack

### Backend

* Python
* FastAPI
* SQLite
* Pandas
* yfinance

### Frontend

* HTML
* CSS
* JavaScript
* Chart.js

---

## 📁 Project Structure

```
stock-data-intelligence-dashboard/
│
├── main.py              # FastAPI backend
├── stocks.db            # SQLite database
├── requirements.txt
├── README.md
│
├── static/              # Frontend files
│   ├── index.html
│   ├── style.css
│   └── script.js
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/arpitsharma2028/stock-data-intelligence-dashboard.git
cd stock-data-intelligence-dashboard
```

### 2️⃣ Install dependencies

```bash
pip install -r requirements.txt
```

### 3️⃣ Run the backend server

```bash
python -m uvicorn main:app --reload
```

### 4️⃣ Open in browser

Navigate to the following URL to view the dashboard:
```
http://127.0.0.1:8000/static/index.html
```

---

## 📡 API Endpoints

| Endpoint            | Method | Description |
| ------------------- | ------ | ----------- |
| `/companies`        | GET    | List all supported companies and sectors |
| `/data/{symbol}`    | GET    | Fetch historical stock data (configurable range) |
| `/summary/{symbol}` | GET    | Get 52-week highs/lows, volatility score, and top gainers/losers |
| `/forecast/{symbol}`| GET    | Generate a 14-day Monte Carlo probability forecast |
| `/compare`          | GET    | Normalize and compare two stocks' performance |

*Interactive Swagger documentation is auto-generated and available at `http://127.0.0.1:8000/docs`.*

---

## 📊 Supported Stocks (Examples)

* RELIANCE (Energy)
* TCS (IT)
* INFY (IT)
* HDFCBANK (Banking)
* ICICIBANK (Banking)
* WIPRO (IT)
* *(Easily expandable in the backend configuration)*

---

## 🧠 Key Learnings & Architecture

* **Resilient Architecture:** Implemented smart fallback systems and retry logic to gracefully handle unreliable external APIs or network restrictions.
* **Mathematical Modeling:** Translated complex quantitative finance formulas (Geometric Brownian Motion) into actionable backend Python logic.
* **Full-Stack Integration:** Built a seamless pipeline from raw data ingestion, to mathematical processing, to REST API delivery, to interactive frontend rendering.



## 👨‍💻 Author

**Arpit Sharma**  

---

## ⭐ Show your support

If you found this project useful:

👉 Give it a ⭐ on GitHub  
👉 Share it with others  

---

