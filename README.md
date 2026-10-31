# DPB - Digital PennyBin

**How to achieve zero-latency, fee-free state transitions in a closed-loop micro-ledger.**

## What is Digital Penny Bin (DPB)?

Inspired by the classic "give a penny / take a penny" tray at the checkout counter, Digital Penny Bin (DPB) introduces a paradigm-shifting, settlement-less transaction system. Instead of moving value between external bank accounts or blockchains, users pool and pay from small balances inside a shared online ledger or bucket—eliminating traditional interchange fees, authorization, and settlement times.

DPB allows point-of-sale terminals—even ones configured with completely different rounding rules (round to the nearest nickel vs. round to the nearest dollar)—to share a single pooled balance for fractional-cent change. Instead of a customer's $0.03 in change disappearing into a coin jar or a rounding error, it gets tracked in a shared ledger bucket and used to give the next customer, at any connected terminal, a discount that rounds their total down instead of up.

---

## The Current Paradigm

When User A pays User B using digital rails or checking accounts, the funds must move or settle through third-party intermediaries and payment networks. Because these middlemen facilitate the settlement, they extract a fee from every single transaction.

* **Credit cards** charge merchants 1.5% to 3.5% in interchange fees just to clear funds.
* **Public blockchains** force every interaction onto a global public ledger requiring network gas tokens, wallet setup, and external token volatility.
* **Physical cash** is fee-free, but it brings a heavy operational toll: coin friction, counting overhead, daily reconciliation, and losses from human error.

---

## The New Settlementless Paradigm

DPB bypasses coin friction, banks, and credit card networks altogether. Because funds never leave the shared ledger—unlike traditional checking accounts—they remain in a permanent, pooled state while circulating instantly between users.

---

## Why DPB? (L2 Rails vs. Local Ledger Bucketing)

While layer-2 payment rails like the Lightning Network have revolutionized Bitcoin scaling, attempting to force high-frequency, ultra-low-value interactions (such as fractional remainders or penny-scale round-ups) through global L2 rails exposes fundamental architectural constraints:

* **Bilateral State Channel Overhead:** Lightning is built on bilateral state channels secured by Hash Time-Locked Contracts (HTLCs). Every hop requires locked capital, and routing payments inherently shifts local balances, creating directional liquidity imbalances. Forcing a POS terminal to rely on multi-hop pathfinding for minor local change introduces unnecessary routing complexity and capital lockup.
* **Synchronous Invoicing Dependencies:** Unlike legacy card rails that support store-and-forward offline batching, Lightning is aggressively synchronous—requiring sender, receiver, and routing nodes to be online simultaneously to negotiate and clear an invoice. A brief internet blip at the cash register halts live invoice generation and creates an immediate bottleneck.

### The DPB Complementary Model: Local Ledger Bucketing

Digital Penny Bin does not compete with L2 rails; instead, it provides a hyper-local, offline-resilient shock absorber designed specifically for the physical point-of-sale:

* **Asynchronous Local Pooling:** DPB bypasses global routing constraints by accumulating and circulating fractional remainders inside a secure, internal local ledger bucket. Because these micro-adjustments stay local, they require zero multi-hop pathfinding or capital locking at the register.
* **Offline Resilience:** Local bucketing operates independently of live network synchronization. Transactions at the counter proceed instantly without risking invoice routing failures or channel saturation during connectivity drops.
* **The Consolidated Hand-Off:** Rather than hammering L2 channels with a continuous stream of micro-dust, local buckets accumulate value and settle out in clean, aggregated batches only when required—making DPB an ideal companion layer for merchants running modern open-source POS infrastructure.

---

## The Problem with Small Dollar Payments

When you buy a gallon of milk or a carton of eggs, traditional payment methods force a bad trade-off:

* **Credit & Debit Cards:** Low latency and fast at the register, but traditional interchange fees and gateway costs leave little to no profit for merchants on small purchases.
* **Blockchain & Digital Currencies:** Eliminate high processing fees and middlemen, but suffer from slow confirmation times that make buying everyday items at the physical point-of-sale impractical.

### Enter Settlementless

DPB is the only cost-effective method built specifically to handle sub-dollar—and ultimately whole-dollar—transactions at the physical point-of-sale.

Since funds do not cross bank accounts and remain indefinitely inside the bin, they do not clear or settle. Therefore, DPB offers a truly sovereign alternative: zero gateway fees, zero token volatility, and zero corporate middlemen.

---

## Core Technical Solutions

* **Cross-Tier Funding:** A terminal configured for dollar-level rounding can fund discounts at a terminal configured for nickel-level rounding, without either terminal knowing the other exists.
* **Offline Tolerance:** A terminal that loses its network connection keeps working against a local buffer, and reconciles back into the shared ledger when it reconnects, without corrupting the shared balance even if multiple terminals reconnect at once.
* **Tamper-Evident Auditing:** Every balance change is chained cryptographically (HMAC-SHA256) so the full history is verifiable.

*(Full technical detail is available in `/docs/architecture.md`)*

---

## Status & Patent Pending

* **Status:** Early / pre-production.
* **Patent Pending:** U.S. Provisional Patent Application covering the cross-tier funding mechanism and offline reconciliation protocol filed in September 2026. *(A provisional application establishes a priority date while the underlying invention is evaluated further and does not guarantee an issued patent.)*
* **License:** Preparing to utilize a specialized licensing model (such as the Business Source License / BSL) to allow open viewing and contribution while preserving commercialization rights during an initial period. Full terms coming soon.

---

## Repository Structure

```text
dpb/
├── core/                                # Ledger engine, tier logic, reconciliation
│   ├── ledger.ts                        # Shared balance, Take/Give/Exact decision logic
│   ├── reconciliation.ts                # Admission control, idempotency, offline sync
│   └── audit_chain.ts                   # HMAC-SHA256 chaining
├── adapters/                            # Platform-specific integrations
│   ├── square/                          # (help wanted)
│   ├── toast/                           # (help wanted)
│   ├── odoo/                            # (help wanted)
│   └── generic_rest/                    # Minimal reference REST API
├── docs/
│   ├── architecture.md                  # Full technical writeup
│   └── reconciliation-protocol.md
├── tests/
└── CONTRIBUTING.md

What Help Is Actually Needed

Concurrency review: The reconciliation engine uses version-checked compare-and-swap to serialize concurrent terminal writes and admission-control logic to prevent the shared balance's ceiling from being exceeded when multiple offline terminals reconcile at once. This needs eyes from someone with real distributed-systems experience.

Test coverage: The core Take/Give/Exact logic, tier boundary conditions, and reconciliation edge cases (concurrent reconnects, duplicate batch submission, partial ceiling admission) need real test suites.

Security review: Particularly around HMAC key management and the plausibility/anomaly-detection bounds on offline batch reconciliation.

Platform adapters: Square, Toast, Odoo, Clover, and others. If you know one of these platforms well, this is the most self-contained way to contribute.

Documentation: Clearer setup instructions, a proper API reference, and a "getting started" path. Check CONTRIBUTING.md for good-first-issue labels.

Getting Started: Running the Server
The DPB backend is built on Node.js and TypeScript.

Prerequisites
Node.js (v18+ recommended)
Git

Step 1: Clone the Repository
git clone https://github.com/lefteri28-afk/digital-penny-bin.git

Step 2: Navigate into the folder
cd digital-penny-bin

Step 3: Install Dependencies
npm install

Step 4: Build and Start the Server
npm run build
npm start

Step 5: Access the Interface
Open your browser and navigate to http://localhost:3000 to interact with the local DPB micro-ledger service.

Questions & Getting in Touch
Bug Reports & Feature Requests:\
Please open an [Issue](https://github.com/lefteri28-afk/digital-penny-bin/issues) on GitHub.
General Discussion & Architecture Q&A
Join the conversation on [GitHub Discussions](https://github.com/lefteri28-afk/digital-penny-bin/discussions).
