import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), 'public')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'online', service: 'Digital Penny Bin Engine', version: '5.0' });
});

app.post('/api/pos/transaction', (req, res) => {
  const { transactionCents, amount } = req.body;
  const totalCents = transactionCents !== undefined ? transactionCents : Math.round((amount || 0) * 100);
  const dollars = totalCents / 100;

  const remainder = Number((dollars % 1).toFixed(2));
  const pennyBinContribution = remainder > 0 ? Number((1 - remainder).toFixed(2)) : 0;
  const roundUpCents = Math.round(pennyBinContribution * 100);
  const totalCharged = Number((dollars + pennyBinContribution).toFixed(2));

  res.json({
    originalAmount: dollars,
    pennyBinContribution,
    contribution: pennyBinContribution,
    roundUpCents,
    totalCharged,
    total: totalCharged,
    amountPaid: totalCharged,
    status: 'success'
  });
});

app.listen(PORT, () => {
  console.log(`Digital Penny Bin server running on port ${PORT}`);
});
