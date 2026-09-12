import axios from 'axios';

const SERVER_URL = 'http://localhost:3000/api/pos/transaction';
const SIMULATION_LOOPS = 5;
const DELAY_MS = 2500;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function simulateCustomerCheckout(transactionId: number) {
  const randomFractionalCents = Math.floor(Math.random() * 5);
  const baseBillAmount = 10.00;
  const originalBill = baseBillAmount + (randomFractionalCents / 100);

  console.log(`\n================ [ CUSTOMER #${transactionId} ] ================`);
  console.log(`🛒 POS Total Rang Up: $${originalBill.toFixed(2)} (Fractional Cents: ${randomFractionalCents}¢)`);

  try {
    const response = await axios.post(SERVER_URL, { transactionCents: randomFractionalCents });
    const { action, adjustmentCents, currentBinBalance } = response.data;
    let finalBillAmount = originalBill;

    if (action === "ROUND_DOWN") {
      finalBillAmount = originalBill - (adjustmentCents / 100);
      console.log(`✅ Server Response: [${action}]`);
      console.log(`   📉 Action: Bin had enough pennies. Deducted ${adjustmentCents}¢ from the bin.`);
    } else if (action === "ROUND_UP") {
      finalBillAmount = originalBill + (adjustmentCents / 100);
      console.log(`✅ Server Response: [${action}]`);
      console.log(`   📈 Action: Bin was too low. Credited ${adjustmentCents}¢ overpayment to the bin.`);
    }

    console.log(`💰 Final Adjusted Bill Paid at Counter: $${finalBillAmount.toFixed(2)}`);
    console.log(`🍯 New Shared Community Bin Balance: [ ${currentBinBalance}¢ / 4¢ ]`);
  } catch (error: any) {
    console.error(`❌ POS Connection Error: ${error.message}`);
  }
}

async function runPOSSimulator() {
  console.log("🚀 Starting Digital Penny Bin Mock POS Terminal Simulator...");
  for (let i = 1; i <= SIMULATION_LOOPS; i++) {
    await simulateCustomerCheckout(i);
    if (i < SIMULATION_LOOPS) await sleep(DELAY_MS);
  }
  console.log("\n🏁 Simulation completed successfully.");
}

runPOSSimulator();
