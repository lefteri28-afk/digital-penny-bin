import express from 'express';
import path from 'path';
import sqlite3 from 'sqlite3';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), 'public')));

// Initialize SQLite Database (persists to disk)
const dbPath = path.join(process.cwd(), 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to SQLite database.');
    db.run(`CREATE TABLE IF NOT EXISTS bin_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      balance INTEGER NOT NULL
    )`, (createErr) => {
      if (!createErr) {
        db.run(`INSERT OR IGNORE INTO bin_state (id, balance) VALUES (1, 0)`);
      }
    });
  }
});

const MAX_CAP = 4;

app.get('/api/health', (req, res) => {
  res.json({ status: 'online', service: 'Digital Penny Bin Engine', version: '5.0' });
});

app.post('/api/pos/transaction', (req, res) => {
  const { transactionCents, amount } = req.body;
  const totalCents = transactionCents !== undefined ? transactionCents : Math.round((amount || 0) * 100);
  
  const remainder = totalCents % 5;

  db.get(`SELECT balance FROM bin_state WHERE id = 1`, (err, row: any) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }

    let globalBinBalance = row ? row.balance : 0;
    let action = 'EXACT';
    let adjustmentCents = 0;

    if (remainder > 0) {
      if (globalBinBalance >= remainder) {
        action = 'ROUND_DOWN';
        adjustmentCents = remainder;
        globalBinBalance -= remainder;
      } else {
        action = 'ROUND_UP';
        adjustmentCents = 5 - remainder;
        globalBinBalance = Math.min(MAX_CAP, globalBinBalance + adjustmentCents);
      }
    }

    db.run(`UPDATE bin_state SET balance = ? WHERE id = 1`, [globalBinBalance], (updateErr) => {
      if (updateErr) {
        console.error('Failed to update balance', updateErr.message);
      }

      const adjustedTotalCents = action === 'ROUND_DOWN' ? totalCents - adjustmentCents : totalCents + adjustmentCents;

      res.json({
        status: 'success',
        action: action,
        adjustmentCents: adjustmentCents,
        currentBinBalance: globalBinBalance,
        originalAmount: totalCents / 100,
        totalCharged: adjustedTotalCents / 100
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Digital Penny Bin server running on port ${PORT}`);
});
