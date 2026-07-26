import express from 'express';
import type { Request, Response } from 'express';

import cors from 'cors';

// ==========================================
// 1. BULLETPROOF DIGITAL PENNY BIN LEDGER CLASS
// ==========================================
export class PennyBinLedger {
  private binBalance: number;

  constructor() {
    this.binBalance = 0; 
  }

  public getBalance(): number {
    return this.binBalance;
  }

  public updateBin(transactionCents: number): string {
    if (transactionCents < 0 || transactionCents > 4) {
      throw new Error("Invalid transaction value: must be between 0 and 4 cents");
    }
    if (this.binBalance < 0 || this.binBalance > 4) {
      throw new Error("Fatal: Core bin balance corrupted");
    }

    if (this.binBalance >= transactionCents) {
      this.binBalance = this.binBalance - transactionCents;
      if (this.binBalance < 0) this.binBalance = 0;
      return "ROUND_DOWN";
    } else {
      const creditAmount = 5 - transactionCents;
      this.binBalance = this.binBalance + creditAmount;
      if (this.binBalance > 4) this.binBalance = 4;
      return "ROUND_UP";
    }
  }
}

// ==========================================
// 2. THE PRIVATE SERVER ROUTING API
// ==========================================
const app = express();
app.use(cors());
app.use(express.json());

const communityBin = new PennyBinLedger();

// BYPASSES ALL DIRECTORY PATH ERRORS BY SERVING THE SCREEN AS RAW TEXT NATIVELY
app.get('/', (req: Request, res: Response) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Digital Penny Bin POS Simulator</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #f4f6f8; margin: 0; padding: 40px; display: flex; justify-content: center; gap: 30px;
        }
        .card { background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); padding: 24px; width: 360px; }
        h2 { margin-top: 0; color: #1a1f36; font-size: 20px; border-bottom: 2px solid #f4f6f8; padding-bottom: 12px;}
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 8px; font-weight: 600; color: #4f566b; font-size: 14px; }
        input[type="number"] { width: 100%; padding: 12px; border: 1px solid #a5aab5; border-radius: 6px; font-size: 18px; box-sizing: border-box; font-weight: bold; }
        button { width: 100%; background-color: #5469d4; color: white; border: none; padding: 14px; border-radius: 6px; font-size: 16px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
        button:hover { background-color: #0048b5; }
        .bin-container { display: flex; flex-direction: column; align-items: center; justify-content: center; background: #fffdeb; border: 2px dashed #e3b000; border-radius: 12px; padding: 30px; text-align: center; }
        .bin-visual { font-size: 64px; margin-bottom: 10px; }
        .bin-count { font-size: 32px; font-weight: bold; color: #b28000; }
        .log-box { margin-top: 15px; background: #f8f9fa; border: 1px solid #e3e8ee; border-radius: 6px; padding: 12px; font-size: 14px; color: #3c4257; min-height: 80px; }
        .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px; color: white; margin-bottom: 8px; }
        .badge-up { background-color: #e56b6f; }
        .badge-down { background-color: #2ec4b6; }
    </style>
</head>
<body>
    <div class="card">
        <h2>🖥️ POS Checkout Register</h2>
        <div class="form-group">
            <label for="billAmount">Enter Sale Total ($):</label>
            <input type="number" id="billAmount" step="0.01" value="10.02" min="0.01">
        </div>
        <button onclick="processCheckout()">Trigger Checkout</button>
        <div id="receiptLog" class="log-box" style="display: none;"></div>
    </div>
    <div class="card">
        <h2>🍯 Shared Community Bin</h2>
        <div class="bin-container">
            <div class="bin-visual">🪙</div>
            <div id="binTally" class="bin-count">0¢</div>
            <span style="color: #697386; font-size: 12px; font-weight: 600; margin-top: 4px;">MAX CAP: 4¢</span>
        </div>
    </div>
    <script>
        async function processCheckout() {
            const billInput = document.getElementById('billAmount').value;
            const originalBill = parseFloat(billInput);
            if (isNaN(originalBill) || originalBill <= 0) return alert("Enter valid total.");
            
            // Fixed extraction math to strictly target the penny modulus
            const totalCents = Math.round(originalBill * 100);
            const fractionalCents = totalCents % 5;

            try {
                const response = await fetch('/api/pos/transaction', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ transactionCents: fractionalCents })
                });
                const data = await response.json();
                if (data.status === "success") {
                    document.getElementById('binTally').innerText = data.currentBinBalance + '¢';
                    const receiptBox = document.getElementById('receiptLog');
                    receiptBox.style.display = 'block';
                    let adjustedBill = originalBill;
                    let actionBadge = '';
                    if (data.action === "ROUND_DOWN") {
                        adjustedBill = originalBill - (data.adjustmentCents / 100);
                        actionBadge = '<span class="badge badge-down">ROUND DOWN (-' + data.adjustmentCents + '¢)</span>';
                    } else {
                        adjustedBill = originalBill + (data.adjustmentCents / 100);
                        actionBadge = '<span class="badge badge-up">ROUND UP (+' + data.adjustmentCents + '¢)</span>';
                    }
                    receiptBox.innerHTML = actionBadge + '<br>Original Ring: $' + originalBill.toFixed(2) + '<br><strong>Amount Paid: $' + adjustedBill.toFixed(2) + '</strong>';
                }
            } catch (err) { alert("Could not connect to backend."); }
        }
    </script>
</body>
</html>
  `);
});

app.post('/api/pos/transaction', (req: Request, res: Response) => {
  try {
    const { transactionCents } = req.body;
    if (transactionCents === undefined || transactionCents < 0 || transactionCents > 4) {
       res.status(400).json({ error: "Invalid fractional cent payload" });
       return;
    }

    const initialBin = communityBin.getBalance();
    const action = communityBin.updateBin(transactionCents);
    const difference = action === "ROUND_DOWN" ? transactionCents : (5 - transactionCents);
    const updatedBin = communityBin.getBalance();

    res.status(200).json({
      status: "success",
      action: action,               
      adjustmentCents: difference,  
      currentBinBalance: updatedBin 
    });
  } catch (error: any) {
    res.status(500).json({ error: "Internal failure" });
  }
});

app.listen(3000, () => console.log('🚀 Digital Penny Bin Server running on port 3000'));
