const API = '';  // same origin
let currentSymbol = null;
let priceChart = null, returnChart = null, compareChart = null;

// ── Fetch helpers ────────────────────────────────────────────
async function apiFetch(path) {
  const r = await fetch(API + path);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

function showLoader(msg = 'Fetching data…') {
  document.getElementById('loader').classList.add('show');
  document.getElementById('loader-msg').textContent = msg;
}
function hideLoader() { document.getElementById('loader').classList.remove('show'); }

// ── Sidebar ──────────────────────────────────────────────────
async function loadCompanies() {
  try {
    const data = await apiFetch('/companies');
    const el = document.getElementById('company-list');
    el.innerHTML = '';
    data.companies.forEach(c => {
      const div = document.createElement('div');
      div.className = 'company-item';
      div.innerHTML = `<div class="sym">${c.symbol}</div><div class="name">${c.name}</div><span class="tag">${c.sector}</span>`;
      div.onclick = () => selectCompany(c.symbol, c.name);
      el.appendChild(div);
    });
  } catch(e) { document.getElementById('company-list').textContent = 'Error loading companies'; }
}

// ── Select company ───────────────────────────────────────────
async function selectCompany(symbol, name) {
  currentSymbol = symbol;
  document.querySelectorAll('.company-item').forEach(el => {
    el.classList.toggle('active', el.querySelector('.sym').textContent === symbol);
  });
  document.getElementById('stock-title').textContent = `${symbol} — ${name}`;
  document.getElementById('refresh-btn').style.display = '';
  await loadStockView();
}

async function loadStockView() {
  if (!currentSymbol) return;
  const days = +document.getElementById('period-select').value;
  showLoader(`Loading ${currentSymbol} data…`);

  try {
    const [stockData, summary] = await Promise.all([
      apiFetch(`/data/${currentSymbol}?days=${days}`),
      apiFetch(`/summary/${currentSymbol}`)
    ]);

    renderContent(stockData, summary);
  } catch(e) {
    alert('Error: ' + e.message);
  } finally { hideLoader(); }
}

// ── Render ───────────────────────────────────────────────────
function renderContent(stockData, summary) {
  const content = document.getElementById('content');
  content.innerHTML = `
    <div id="stats-row"></div>
    <div id="charts-row">
      <div class="chart-card">
        <h3>📉 Closing Price & 7-day MA</h3>
        <div class="chart-wrap"><canvas id="priceCanvas"></canvas></div>
      </div>
      <div class="chart-card">
        <h3>📊 Daily Return %</h3>
        <div class="chart-wrap"><canvas id="returnCanvas"></canvas></div>
      </div>
    </div>
    <div id="compare-section">
      <h3>🔄 Compare with another stock</h3>
      <div id="compare-controls">
        <select id="cmp-select"></select>
        <select id="cmp-days">
          <option value="30">30 days</option>
          <option value="60">60 days</option>
          <option value="90">90 days</option>
        </select>
        <button onclick="runCompare()">Compare</button>
        <span id="corr-badge"></span>
      </div>
      <div id="compare-wrap"><canvas id="compareCanvas"></canvas></div>
    </div>
    <div id="gl-section" style="display:none">
      <h3>🏆 Today's Top Gainers & Losers</h3>
      <div id="gl-grid"></div>
    </div>
  `;

  // Stats
  const s = summary;
  const latestRow = stockData.data[stockData.data.length - 1] || {};
  const ret = latestRow.daily_return || 0;
  document.getElementById('stats-row').innerHTML = `
    <div class="stat-card">
      <div class="label">Latest Close</div>
      <div class="value">₹${latestRow.close?.toFixed(2) ?? '—'}</div>
      <div class="sub ${ret >= 0 ? 'up' : 'down'}">${ret >= 0 ? '▲' : '▼'} ${Math.abs(ret).toFixed(2)}% today</div>
    </div>
    <div class="stat-card">
      <div class="label">52-week High</div>
      <div class="value up">₹${s['52_week_high'] ?? '—'}</div>
      <div class="sub">Annual peak</div>
    </div>
    <div class="stat-card">
      <div class="label">52-week Low</div>
      <div class="value down">₹${s['52_week_low'] ?? '—'}</div>
      <div class="sub">Annual trough</div>
    </div>
    <div class="stat-card">
      <div class="label">Volatility Score</div>
      <div class="value" style="color:#f59e0b">${s.volatility_score ?? '—'}</div>
      <div class="sub">Annualised std dev</div>
    </div>
  `;

  // Price chart
  const labels  = stockData.data.map(d => d.date);
  const closes  = stockData.data.map(d => d.close);
  const ma7     = stockData.data.map(d => d.ma7);
  const returns = stockData.data.map(d => d.daily_return);

  priceChart?.destroy();
  priceChart = new Chart(document.getElementById('priceCanvas'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Close', data: closes, borderColor: '#4f8ef7', backgroundColor: 'rgba(79,142,247,.08)', fill: true, pointRadius: 0, tension: .3 },
        { label: '7-day MA', data: ma7, borderColor: '#f59e0b', borderDash: [4,3], pointRadius: 0, tension: .3 },
      ]
    },
    options: chartOpts('₹')
  });

  // Return chart
  returnChart?.destroy();
  returnChart = new Chart(document.getElementById('returnCanvas'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Daily Return %',
        data: returns,
        backgroundColor: returns.map(v => v >= 0 ? 'rgba(52,211,153,.7)' : 'rgba(248,113,113,.7)'),
        borderRadius: 2,
      }]
    },
    options: chartOpts('%')
  });

  // Populate compare dropdown
  const cmpSel = document.getElementById('cmp-select');
  cmpSel.innerHTML = '';
  fetch(API + '/companies').then(r => r.json()).then(d => {
    d.companies.filter(c => c.symbol !== currentSymbol).forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.symbol; opt.textContent = `${c.symbol} — ${c.name}`;
      cmpSel.appendChild(opt);
    });
  });
}

// ── Compare ──────────────────────────────────────────────────
async function runCompare() {
  const s2   = document.getElementById('cmp-select').value;
  const days = document.getElementById('cmp-days').value;
  showLoader(`Comparing ${currentSymbol} vs ${s2}…`);
  try {
    const data = await apiFetch(`/compare?symbol1=${currentSymbol}&symbol2=${s2}&days=${days}`);
    const labels = data.dates;

    document.getElementById('corr-badge').innerHTML =
      `Correlation: <span class="corr-val">${data.correlation}</span> &nbsp;|&nbsp; ` +
      `${data[currentSymbol + '_return_pct']}% vs ${data[s2 + '_return_pct']}%`;

    compareChart?.destroy();
    compareChart = new Chart(document.getElementById('compareCanvas'), {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: currentSymbol, data: data[currentSymbol + '_normalised'], borderColor: '#4f8ef7', pointRadius: 0, tension: .3 },
          { label: s2,            data: data[s2 + '_normalised'],            borderColor: '#f59e0b', pointRadius: 0, tension: .3 },
        ]
      },
      options: chartOpts('', 'Normalised to 100')
    });
  } catch(e) { alert('Compare error: ' + e.message); }
  finally { hideLoader(); }
}

// ── Gainers/Losers ───────────────────────────────────────────
async function loadGainersLosers() {
  showLoader('Fetching market overview…');
  try {
    const data = await apiFetch('/gainers-losers');
    if (data.message) { alert(data.message); return; }

    const gl = document.getElementById('gl-section') || null;
    const targetEl = gl || (() => {
      const d = document.createElement('div');
      d.id = 'gl-section';
      document.getElementById('content').appendChild(d);
      return d;
    })();

    targetEl.style.display = '';
    targetEl.innerHTML = `
      <h3>🏆 Today's Top Gainers & Losers</h3>
      <div id="gl-grid">
        <div>
          <p style="color:var(--accent2);font-size:12px;margin-bottom:8px;font-weight:600">▲ TOP GAINERS</p>
          <ul class="gl-list">
            ${data.top_3_gainers.map(g => `
              <li>
                <span class="gl-sym">${g.symbol}</span>
                <span class="gl-ret up">+${g.daily_return?.toFixed(2)}%</span>
              </li>`).join('')}
          </ul>
        </div>
        <div>
          <p style="color:var(--red);font-size:12px;margin-bottom:8px;font-weight:600">▼ TOP LOSERS</p>
          <ul class="gl-list">
            ${data.top_3_losers.map(g => `
              <li>
                <span class="gl-sym">${g.symbol}</span>
                <span class="gl-ret down">${g.daily_return?.toFixed(2)}%</span>
              </li>`).join('')}
          </ul>
        </div>
      </div>
    `;
  } catch(e) { alert('Error: ' + e.message); }
  finally { hideLoader(); }
}

// ── Refresh ───────────────────────────────────────────────────
async function refreshCurrent() {
  if (!currentSymbol) return;
  showLoader(`Refreshing ${currentSymbol}…`);
  try {
    await fetch(API + `/refresh/${currentSymbol}`, { method: 'POST' });
    await loadStockView();
  } catch(e) { alert('Refresh error: ' + e.message); hideLoader(); }
}

// ── Chart defaults ────────────────────────────────────────────
function chartOpts(unit = '', title = '') {
  return {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#94a3b8', font: { size: 11 } } },
      title: title ? { display: true, text: title, color: '#64748b', font: { size: 11 } } : undefined,
      tooltip: {
        callbacks: {
          label: ctx => ` ${ctx.dataset.label}: ${unit === '₹' ? '₹' : ''}${ctx.raw?.toFixed(2)}${unit === '%' ? '%' : ''}`
        }
      }
    },
    scales: {
      x: { ticks: { color: '#64748b', maxTicksLimit: 8, font: { size: 10 } }, grid: { color: '#1e2130' } },
      y: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: '#252a3d' } }
    }
  };
}

// ── Period change ─────────────────────────────────────────────
document.getElementById('period-select').onchange = loadStockView;

// ── Init ──────────────────────────────────────────────────────
loadCompanies();
