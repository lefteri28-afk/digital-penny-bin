import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files if you have a public folder, or serve root
app.use(express.static(path.join(process.cwd(), 'public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'online', service: 'Digital Penny Bin Engine', version: '5.0' });
});

// Example transaction / round-up route placeholder
app.post('/api/process-transaction', (req, res) => {
  const { amount } = req.body;
  
  if (typeof amount !== 'number') {
    return res.status(400).json({ error: 'Invalid transaction amount' });
  }

  // Sub-dollar rounding calculation logic (Mode 1 / Mode 2)
  const remainder = Number((amount % 1).toFixed(2));
  const roundedUp = remainder > 0 ? Number((1 - remainder).toFixed(2)) : 0;

  res.json({
    originalAmount: amount,
    pennyBinContribution: roundedUp,
    totalCharged: Number((amount + roundedUp).toFixed(2)),
    status: 'success'
  });
});

app.listen(PORT, () => {
  console.log(`Digital Penny Bin server running on port ${PORT}`);
});
