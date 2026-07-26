# 🪙 Digital Penny Bin API Server

An open-source, private cloud ledger system that digitizes the classic "give a penny, take a penny" counter tray. Built using Node.js and TypeScript, this server connects directly to Point of Sale (POS) merchant registers to eliminate fractional change friction by rounding totals to clean nickel boundaries.

---

## 📐 Core Mathematical Logic

The ledger maintains a strict community balance cap bound between **0¢ and 4¢**. Let `B` be the current bin balance and `T` be the fractional cent portion of the transaction bill ($0.01 to $0.04 over the nearest nickel).

1. **Take a Penny (`B >= T`)**: If the bin has enough pennies, the transaction total rounds **DOWN** to the nearest nickel. The difference is deducted from the bin (`B_new = B - T`).
2. **Give a Penny (`B < T`)**: If the bin is too low, the transaction total rounds **UP** to the nearest nickel. The customer overpays by the difference, which is credited to the bin (`B_new = B + (5 - T)`).

---

## 📡 API Integration Map

The server provides a unified REST endpoint that any external cash register can ping during a checkout sequence.

### POST `/api/pos/transaction`

**Request Payload (from POS terminal):**
```json
{
  "transactionCents": 3
}
```

**Response Payload (returned to POS terminal):**
```json
{
  "status": "success",
  "action": "ROUND_DOWN",
  "adjustmentCents": 3,
  "currentBinBalance": 1
}
```

---

## 🛠️ How to Help: Open Source Integration Roadmaps

We are looking for volunteer software engineers and POS developers to help write lightweight background integration plugins for the following retail hardware networks:

*   **Toast / Square**: Looking for wrappers to catch checkout checkout values using standard platform webhooks.
*   **Clover**: Need a lightweight Android SDK module to communicate with our endpoint from active merchant screens.
*   **Odoo**: Looking for a Python connector extension module built into the core point-of-sale checkout stack.

---

## 🚀 Quickstart Local Workspace

To spin up the server and interact with the visual cash register panel natively on your local machine, execute:

```bash
# 1. Install project structures
npm install

# 2. Run the cloud server backend
node --experimental-strip-types server.ts
```

Once running, navigate your web browser to **`http://localhost:3000`** to access the interactive POS checkout testing simulator interface.
