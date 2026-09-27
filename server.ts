import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

// In-memory shared bin state (Mode 1: 4¢ Cap Nickel Engine)
let currentBinBalance = 3; // Starting authoritative balance in cents
const MAX_BIN_CAP = 4;

// Endpoint to fetch current bin status
app.get('/api/bin-status', (req: Request, res: Response) => {
  res.json({ binBalance: currentBinBalance, maxCap: MAX_BIN_CAP });
});

// Endpoint to process customer checkout and nickel-increment rounding
app.post('/api/simulate', (req: Request, res: Response) => {
  const { amount } = req.body;
  const totalCents = Math.round((amount % 1) * 100);
  const remainder = totalCents % 5; // Remainder past the lower nickel (0 to 4 cents)
  
  let action = '';
  let message = '';
  let finalPaid = amount;

  if (remainder === 0) {
    action = 'EXACT';
    message = 'Already on a nickel increment. No rounding needed.';
    finalPaid = amount;
  } else {
    const dropPennies = remainder; // e.g., 3¢ for 63¢ (drops from 63 to 60)
    const risePennies = 5 - remainder; // e.g., 2¢ for 63¢ (rises from 63 to 65)

    // Rule: If Bin Balance >= dropPennies, round DOWN to lower nickel and debit bin.
    // Otherwise, round UP to upper nickel and credit bin with risePennies.
    if (currentBinBalance >= dropPennies) {
      currentBinBalance -= dropPennies;
      action = 'ROUND_DOWN';
      const adjustedCents = totalCents - dropPennies;
      finalPaid = Math.floor(amount) + (adjustedCents / 100);
      message = `Bin sufficient (${currentBinBalance + dropPennies}¢ >= ${dropPennies}¢). Rounded DOWN by ${dropPennies}¢. Debited bin.`;
    } else {
      const priorBalance = currentBinBalance;
      currentBinBalance += risePennies;
      action = 'ROUND_UP';
      const adjustedCents = totalCents + risePennies;
      const dollarBump = Math.floor(adjustedCents / 100);
      finalPaid = Math.floor(amount) + dollarBump + ((adjustedCents % 100) / 100);
      message = `Bin insufficient (${priorBalance}¢ < ${dropPennies}¢). Rounded UP by ${risePennies}¢. Credited bin.`;
    }
  }

  // Enforce strict Max Bin Capacity cap (4¢) and floor (0¢)
  if (currentBinBalance > MAX_BIN_CAP) currentBinBalance = MAX_BIN_CAP;
  if (currentBinBalance < 0) currentBinBalance = 0;

  res.json({
    action,
    message,
    finalPaid: Number(finalPaid.toFixed(2)),
    binBalance: currentBinBalance
  });
});

app.listen(3000, () => {
  console.log('DPB Server running on port 3000');
});
