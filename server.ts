import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), 'public')));

// Running mock community bin tally in cents
let globalBinBalance = 342;

app.get('/api/health', (req, res) => {
  res.json({ status: 'online', service: 'Digital Penny Bin Engine', version: '5.0' });
});

app.post('/api/pos/transaction', (req, res) => {
  const { transactionCents, amount } = req.body;
  const totalCents = transactionCents !== undefined ? transactionCents : Math.round((amount || 0) * 100);
  
  const remainder = totalCents % 100;
  const adjustmentCents = remainder > 0 ? 100 - remainder : 0;
  
  if (adjustmentCents > 0) {
    globalBinBalance += adjustmentCents;
  }

  res.json({
    status: 'success',
    action: adjustmentCents > 0 ? 'ROUND_UP' : 'EXACT',
    adjustmentCents: adjustmentCents,
    currentBinBalance: globalBinBalance,
    originalAmount: totalCents / 100,
    totalCharged: (totalCents + adjustmentCents) / 100
  });
});

app.listen(PORT, () => {
  console.log(`Digital Penny Bin server running on port ${PORT}`);
});
