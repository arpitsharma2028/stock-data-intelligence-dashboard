# 📊 Stock Data Intelligence Dashboard

A full-stack financial dashboard that fetches, processes, and visualizes stock market data (NSE) in real-time using **FastAPI, SQLite, and JavaScript**.

🔗 **Live Project (Local):** http://127.0.0.1:8000/static/index.html
📂 **Repository:** https://github.com/arpitsharma2028/stock-data-intelligence-dashboard

---

## 🚀 Features

* 📈 Real-time stock data using **Yahoo Finance (yfinance)**
* 📊 Interactive charts with **Chart.js**
* 🧠 Technical indicators:

  * Daily Return %
  * Moving Average (MA7)
* 💾 Local storage using **SQLite**
* 🔁 Smart fallback system when API fails
* ⚡ Fast backend powered by **FastAPI**
* 🎯 Clean, responsive dashboard UI

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

---

### 2️⃣ Install dependencies

```bash
pip install -r requirements.txt
```

---

### 3️⃣ Run the backend server

```bash
python -m uvicorn main:app --reload
```

---

### 4️⃣ Open in browser

```
http://127.0.0.1:8000/static/index.html
```

---

## 📡 API Endpoints

| Endpoint            | Description               |
| ------------------- | ------------------------- |
| `/data/{symbol}`    | Get historical stock data |
| `/summary/{symbol}` | Get stock summary         |
| `/companies`        | List available companies  |

---

## 📊 Supported Stocks

* RELIANCE
* TCS
* INFY
* HDFCBANK
* ICICIBANK
* WIPRO

---

## ⚠️ Important Notes

* This project uses **Yahoo Finance API (yfinance)** which may:

  * Fail on restricted networks (e.g., college WiFi)
  * Be rate-limited
* A **fallback system + retry logic** ensures app stability

---

## 🧠 Key Learnings

* Building REST APIs with FastAPI
* Handling unreliable external APIs
* Data processing using Pandas
* Frontend-backend integration
* Debugging real-world issues (API, network, static files)

---

## 🚀 Future Improvements

* 🔐 User authentication (login/signup)
* ☁️ Deployment (Render / Railway / AWS)
* 📊 More indicators (RSI, MACD)
* 📁 Portfolio tracking
* 🎨 UI improvements (animations, themes)

---

## 👨‍💻 Author

**Arpit Sharma**
B.Tech CSE Student

---

## ⭐ Show your support

If you found this project useful:

👉 Give it a ⭐ on GitHub
👉 Share it with others

---

## 💬 Feedback

Feel free to open issues or contribute!
