const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const GAMMA_API_URL = 'https://gamma-api.polymarket.com';
const CLOB_API_URL = 'https://clob.polymarket.com';

const BATCH_SIZE = 100; // fetch per API request (before filtering)

const isYesNo = (outcomes) => {
  if (Array.isArray(outcomes)) return outcomes.length === 2 && outcomes[0] === 'Yes' && outcomes[1] === 'No';
  if (typeof outcomes === 'string') {
    try {
      const arr = JSON.parse(outcomes);
      return Array.isArray(arr) && arr.length === 2 && arr[0] === 'Yes' && arr[1] === 'No';
    } catch { return false; }
  }
  return false;
};

app.get('/api/markets', async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    const page = Math.floor(Number(offset) / (Number(limit) || 10));
    const apiOffset = page * BATCH_SIZE;

    const response = await axios.get(`${GAMMA_API_URL}/markets`, {
      params: {
        limit: BATCH_SIZE,
        offset: apiOffset,
        active: true,
        closed: false,
        order: 'volume',
        ascending: false
      }
    });

    const yesNoMarkets = response.data.filter((m) => isYesNo(m.outcomes));
    const limitNum = Number(limit) || 10;
    const paginated = yesNoMarkets.slice(0, limitNum).map((m) => {
      const clobTokenIds = typeof m.clobTokenIds === 'string'
        ? (() => { try { return JSON.parse(m.clobTokenIds); } catch { return []; } })()
        : Array.isArray(m.clobTokenIds) ? m.clobTokenIds : [];
      return { ...m, clobTokenIds };
    });

    res.json(paginated);
  } catch (error) {
    console.error('Error fetching markets:', error.message);
    res.status(500).json({ error: 'Failed to fetch markets' });
  }
});

// Historical price data for charts (Polymarket CLOB API)
app.get('/api/markets/:tokenId/price-history', async (req, res) => {
  const { tokenId } = req.params;
  if (!tokenId) {
    return res.json([]);
  }
  try {
    const { interval = '1d', fidelity = 60 } = req.query;
    const validIntervals = ['max', '1w', '1d', '6h', '1h'];
    const safeInterval = validIntervals.includes(interval) ? interval : '1d';

    const response = await axios.get(`${CLOB_API_URL}/prices-history`, {
      params: {
        market: tokenId,
        interval: safeInterval,
        fidelity: Number(fidelity) || 60,
      },
      timeout: 10000,
      validateStatus: (s) => s < 500
    });

    if (response.status !== 200) {
      console.warn('Price history non-200:', response.status, JSON.stringify(response.data));
      return res.json([]);
    }

    const history = response.data?.history || response.data || [];
    const arr = Array.isArray(history) ? history : [];
    res.json(arr);
  } catch (error) {
    console.warn('Price history fetch failed:', error.response?.status, error.message);
    res.json([]);
  }
});

// Current mid price for a token (used for polling fallback)
app.get('/api/markets/:tokenId/midpoint', async (req, res) => {
  const { tokenId } = req.params;
  if (!tokenId) return res.status(400).json({ error: 'Missing tokenId' });
  try {
    const response = await axios.get(`${CLOB_API_URL}/midpoint`, {
      params: { token_id: tokenId },
      timeout: 5000,
    });
    res.json(response.data); // { mid: "0.123" }
  } catch (error) {
    console.warn('Midpoint fetch failed:', error.message);
    res.status(500).json({ error: 'Failed to fetch midpoint' });
  }
});

// Best buy/sell price for a token (ask = what you pay to buy, bid = what you get to sell)
app.get('/api/markets/:tokenId/best-price', async (req, res) => {
  const { tokenId } = req.params;
  const { side = 'BUY' } = req.query;
  if (!tokenId) return res.status(400).json({ error: 'Missing tokenId' });
  try {
    const response = await axios.get(`${CLOB_API_URL}/price`, {
      params: { token_id: tokenId, side: side.toUpperCase() },
      timeout: 5000,
    });
    res.json(response.data); // { price: "0.21" }
  } catch (error) {
    console.warn('Best price fetch failed:', error.message);
    res.status(500).json({ error: 'Failed to fetch best price' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
