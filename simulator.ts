import axios from 'axios';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function checkBinStatus() {
  try {
    const res = await axios.get('http://localhost:3000/api/bin-status');
    return res.data;
  } catch (err) {
    console.log("❌ POS Connection Error: Unable to reach DPB server on port 3000.");
    process.exit(1);
  }
}

async function promptUser() {
  const status = await checkBinStatus();
  console.log(`\n🍯 Current Shared Community Bin Balance: [ ${status.binBalance}¢ / ${status.maxCap}¢ ]`);
  
  rl.question('🛒 Enter transaction amount (e.g., 15.78 or type "exit" to quit): ', async (input) => {
    if (input.toLowerCase() === 'exit') {
      console.log('Exiting DPB Simulator.');
      rl.close();
      process.exit(0);
    }

    const amount = parseFloat(input);
    if (isNaN(amount) || amount <= 0) {
      console.log('❌ Invalid amount. Please enter a valid dollar value (e.g., 10.23)');
      return promptUser();
    }

    try {
      const response = await axios.post('http://localhost:3000/api/simulate', { amount });
      const data = response.data;

      console.log(`✅ Server Response: [${data.action}]`);
      console.log(`   📈📉 Action: ${data.message}`);
      console.log(`💰 Final Adjusted Bill Paid at Counter: $${data.finalPaid.toFixed(2)}`);
      console.log(`🍯 New Shared Community Bin Balance: [ ${data.binBalance}¢ / ${status.maxCap}¢ ]`);
    } catch (err) {
      console.log(`❌ Error processing transaction with server.`);
    }

    promptUser();
  });
}

async function start() {
  console.log("=== Digital Penny Bin (DPB) Interactive POS Terminal ===");
  promptUser();
}

start();
