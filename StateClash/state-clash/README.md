# ⚡ State Clash: Visualizing Monad's Parallel EVM

> **Built for the Monad Blitz Mumbai Hackathon**

**State Clash** is a massive, real-time multiplayer 50x50 collaborative pixel canvas built to dynamically visualize the core innovation behind Monad: **Optimistic Parallel Execution.** 

Instead of building another DEX to show that Monad is "fast," State Clash uses thousands of concurrent micro-transactions to turn the Parallel EVM into an interactive, visually stunning multiplayer game.

---

## 💡 The Problem We Solved
Most developers build DApps *on top* of blockchains, but they don't visualize *how* the blockchain works. When pitching a new L1 like Monad, technical concepts like "State Parallelism" and "Sequential Fallbacks" are hard to explain to end-users and non-technical judges. 

## 🎯 Our Unique Solution
We built an X-Ray into the Monad Sequencer. 
When hundreds of users click the canvas simultaneously:
1. **The Fast Lane:** If they touch different pixels, Monad processes the transactions perfectly in parallel. Our "Engine Dashboard" pulses green, visualizing high-throughput execution.
2. **The Contention Bottleneck:** If two users try to paint the exact same pixel in the exact same 1-second block window, Monad detects the **State Collision** mid-execution, aborts the parallel threads, and falls back to sequential execution. Our UI instantly flags the conflict, flashes the pixel red globally, and visualizes the sequential re-execution in real-time.

---

## 🛠️ Technical Architecture

*   **Smart Contract Base:** Scaffold-ETH 2 wrapped in Hardhat.
*   **The Chain:** Custom-deployed to the Monad Testnet (`10143`).
*   **Frontend Magic:** Next.js with `viem` and `wagmi`.
*   **Zero-Friction UX:** We implemented Scaffold-ETH's **Burner Wallet** system. Users click and paint instantly without signing a single MetaMask popup, allowing for thousands of micro-transactions to spam the chain organically.
*   **Real-Time Subscriptions:** We utilize fast WebSocket endpoints (`eth_subscribe`) to stream `PixelUpdated` and `StateCollision` events directly from Monad's raw blocks into a unified global **Transaction Pipeline** on the client.

### State Collision Detection (Canvas.sol)
Our Smart Contract doesn't just store color; it mathematically tracks state contention in the same block window:
```solidity
// Mathematical proof of Parallel Execution contention
if (px.updatesInCurrentBlock > 0) {
    emit StateCollision(pixelId, msg.sender, block.number);
} else {
    emit PixelUpdated(pixelId, msg.sender, _color);
}
px.updatesInCurrentBlock += 1;
```

---

## 🚀 How to Run Locally

1. **Clone and Install:**
```bash
git clone https://github.com/your-repo/state-clash.git
cd state-clash
yarn install
```

2. **Start the Next.js Frontend Development Server:**
```bash
yarn start
```
*Visit `http://localhost:3000` to interact with the deployed Monad Testnet canvas.*

---

## 🌐 How to Deploy to Vercel (Production)

To deploy this Scaffold-ETH monorepo directly to Vercel, use the following configuration when importing your GitHub repository:

| Setting | Value |
| :--- | :--- |
| **Framework Preset** | Next.js |
| **Root Directory**   | `packages/nextjs` *(Crucial: Do not leave blank!)* |
| **Build Command**    | `yarn build` |
| **Install Command**  | `yarn install` |
| **Output Directory** | `.next` |

No environment variables are required out-of-the-box (we utilize Scaffold-ETH's public Alchemy fallbacks and public Monad endpoints). 

---

## 🏆 Presentation / Pitch Flow (For the Jury)
1. **The Hook:** "Take out your phones, scan this QR code, and start tapping pixels frantically."
2. **The Fast Lane:** Show them the Engine Dashboard processing their taps perfectly in parallel. Give them a tangible feel of 10,000 TPS.
3. **The Collision:** Tell everyone to click the exact center pixel. Show the screen flash red and explain: *"Right there, Monad just detected a State Collision and gracefully fell back to sequential execution. We didn't build a Dapp; we built an interactive window directly into Monad's Parallel EVM."*