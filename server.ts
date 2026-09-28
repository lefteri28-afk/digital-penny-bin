import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), 'public')));

let globalBinBalance = 1; 
const MAX_CAP = 4;

app.get('/api/health', (req, res) => {
  res.json({ status: 'online', service: 'Digital Penny Bin Engine', version: '5.0' });
});

app.post('/api/pos/transaction', (req, res) => {
  const { transactionCents, amount } = req.body;
  const totalCents = transactionCents !== undefined ? transactionCents : Math.round((amount || 0) * 100);
  
  // 5-cent (nickel) increment rounding rule
  const remainder = totalCents % 5;
  let action = 'EXACT';
  let adjustmentCents = 0;

  if (remainder > 0) {
    action = 'ROUND_UP';
    adjustmentCents = 5 - remainder;
    globalBinBalance = Math.min(MAX_CAP, globalBinBalance + adjustmentCents);
  }

  const adjustedTotalCents = totalCents + adjustmentCents;

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
