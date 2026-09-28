import express from 'express';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), 'public')));

// JSON file persistence path
const dbFile = path.join(process.cwd(), 'database.json');

// Helper to read balance
function getBalance(): number {
  try {
    if (fs.existsSync(dbFile)) {
      const data = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
      return typeof data.balance === 'number' ? data.balance : 0;
    }
  } catch (e) {
    console.error('Error reading database file', e);
  }
  return 0;
}

// Helper to save balance
function saveBalance(balance: number) {
  try {
    fs.writeFileSync(dbFile, JSON.stringify({ balance }));
  } catch (e) {
    console.error('Error writing database file', e);
  }
}

const MAX_CAP = 4;

app.get('/api/health', (req, res) => {
  res.json({ status: 'online', service: 'Digital Penny Bin Engine', version: '5.0' });
});

app.post('/api/pos/transaction', (req, res) => {
  const { transactionCents, amount } = req.body;
  const totalCents = transactionCents !== undefined ? transactionCents : Math.round((amount || 0) * 100);
  
  const remainder = totalCents % 5;
  let globalBinBalance = getBalance();
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

  saveBalance(globalBinBalance);

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

app.listen(PORT, () => {
  console.log(`Digital Penny Bin server running on port ${PORT}`);
});
