# 🔊 MumbaiNoise: DePIN for Urban Monitoring

**A Decentralized Physical Infrastructure Network (DePIN) for real-time noise pollution mapping in Mumbai, powered by the Monad Blockchain.**

---

## 🚀 Overview
MumbaiNoise addresses the critical lack of granular noise pollution data in Mumbai. By turning every smartphone into a verifiable sensor, we provide the Brihanmumbai Municipal Corporation (BMC) with a high-resolution, privacy-preserving heatmap of city-wide acoustics.

Built during the **Monad Blitz Mumbai V2**, this project leverages Monad's high-throughput architecture to handle massive concurrency during peak festival seasons (Ganpati, Diwali).



---

## 🛠 Problem & Solution

### **The Problem**
* **Static Infrastructure:** Fixed sensors are expensive and can't cover Mumbai's complex "gullies."
* **Data Deserts:** High-rises and informal settlements are often unmonitored.
* **Privacy Concerns:** Centralized recording raises surveillance fears.
* **Incentive Gap:** No existing reason for citizens to report data.

### **The Solution**
* **Crowdsourced Sensing:** Use mobile microphones for distributed data collection.
* **Monad Blockchain:** Process 10,000+ TPS with near-instant finality and $0.001 gas fees.
* **Feronian Reallocation:** Smart contracts dynamically increase $MON rewards in "Data Deserts" (low-reporting zones).
* **ZK-Privacy:** Zero-Knowledge Proofs verify noise levels without capturing audio or revealing exact identities.

---

## ⚙️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Blockchain** | Monad Testnet |
| **Smart Contracts** | Solidity (OpenZeppelin) |
| **Frontend** | React.js + Vite |
| **Styling** | Tailwind CSS + Lucide Icons |
| **Web3 Bridge** | Ethers.js |
| **Privacy** | ZK-Proof Logic (Simulation) |

---

## 🏗 System Architecture

1. **Capture:** User measures noise (dB) directly via the Web Audio API.
2. **Verify:** The app generates a cryptographic attestation of the reading.
3. **Submit:** Data is sent to the `NoiseRewards.sol` contract on Monad.
4. **Reward:** Contract calculates the "Feronian Multiplier" and assigns $MON rewards.
5. **Visualize:** Data is aggregated into a live public heatmap.

---

## 📂 Project Structure

```text
mumbai-noise/
├── contracts/ # Solidity Smart Contracts
│ ├── MumbaiNoise.sol # Core reward & reallocation logic
│ └── ZKVerifier.sol # ZK-Proof verification endpoint
├── src/                     
│ ├── hooks/ # useNoise.js (Microphone) & useWeb3.js (Blockchain)
│ ├── utils/ # ABI & Helper functions
│ └── App.jsx # Main UI & Documentation Dashboard
└── scripts/ # Deployment scripts
