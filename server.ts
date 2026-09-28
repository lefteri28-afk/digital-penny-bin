import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), 'public')));

// DPB Mode 1 Bounded State Buffer (Initialized within the 4¢ max cap)
let globalBinBalance = 2; 
const MAX_CAP = 4;

app.get('/api/health', (req, res) => {
  res.json({ status: 'online', service: 'Digital Penny Bin Engine', version: '5.0' });
});

app.post('/api/pos/transaction', (req, res) => {
  const { transactionCents, amount } = req.body;
  const totalCents = transactionCents !== undefined ? transactionCents : Math.round((amount || 0) * 100);
  
  const remainder = totalCents % 100;
  let action = 'EXACT';
  let adjustmentCents = 0;

  if (remainder > 0) {
    // State machine: TAKE (round down) if buffer has liquidity, else GIVE (round up)
    if (globalBinBalance >= remainder) {
      action = 'ROUND_DOWN';
      adjustmentCents = remainder;
      globalBinBalance -= remainder;
    } else {
      action = 'ROUND_UP';
      adjustmentCents = 100 - remainder;
      // Replenish buffer, clamped strictly to the 4¢ operational ceiling
      globalBinBalance = Math.min(MAX_CAP, globalBinBalance + adjustmentCents);
    }
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

app.listen(PORT, () => {
  console.log(`Digital Penny Bin server running on port ${PORT}`);
});
